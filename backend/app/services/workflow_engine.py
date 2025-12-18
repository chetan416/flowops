import time
import httpx
import redis
import json
from sqlalchemy.orm import Session
from app.domain.workflow.models import Workflow
from app.core.config import settings

class WorkflowEngine:
    def __init__(self):
        # Initialize Redis client for publishing events
        # We use a sync client here because Celery tasks are typically sync
        self.redis = redis.from_url(settings.REDIS_URL)

    def _emit_event(self, event_type: str, workflow_id: int, payload: dict = None):
        """Publishes an event to the Redis 'events' channel"""
        message = {
            "type": event_type,
            "workflow_id": workflow_id,
            "timestamp": time.time(),
            **(payload or {})
        }
        try:
            # The SocketManager expects {type: "message", data: JSON_STRING} from Redis
            # Wait, looking at socket_manager.py:
            # if message["type"] == "message":
            #    data = json.loads(message["data"])
            #    await self.broadcast_local(data)
            # So we just need to publish the JSON string to the channel.
            self.redis.publish("events", json.dumps(message))
        except Exception as e:
            print(f"Failed to emit event {event_type}: {e}")

    def execute_workflow(self, db: Session, workflow_id: int):
        workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            print(f"Workflow {workflow_id} not found.")
            return

        print(f"Starting execution of workflow: {workflow.name}")
        self._emit_event("workflow_start", workflow_id, {"name": workflow.name})
        
        # steps[0] contains { "nodes": [...], "edges": [...] }
        graph_data = workflow.steps[0] if workflow.steps and len(workflow.steps) > 0 else {}
        nodes = {node['id']: node for node in graph_data.get('nodes', [])}
        edges = graph_data.get('edges', [])
        
        # Build Adjacency List: source_id -> [(target_id, source_handle)]
        adjacency_list = {}
        for edge in edges:
            source = edge['source']
            target = edge['target']
            source_handle = edge.get('sourceHandle') # Important for ConditionNode (true/false)
            
            if source not in adjacency_list:
                adjacency_list[source] = []
            adjacency_list[source].append((target, source_handle))

        # Find Start Node (TriggerNode)
        start_node_id = None
        for node_id, node in nodes.items():
            if node.get('type') == 'triggerNode':
                start_node_id = node_id
                break
        
        if not start_node_id and nodes:
            # Fallback for legacy data: pick first node
            start_node_id = list(nodes.keys())[0]

        if not start_node_id:
             print("No start node found.")
             self._emit_event("workflow_finish", workflow_id, {"status": "error", "message": "No start node"})
             return

        # Execution Queue: [(node_id, incoming_handle)]
        queue = [start_node_id]
        visited = set() # Avoid cycles for now, though loops might be valid later
        
        step_index = 0
        while queue:
            current_id = queue.pop(0)
            
            # Skip if already visited implies simpler DAG. 
            # Real engine needs sophisticated state management for loops/joins.
            # Allowing re-visit for now if logic demands, but let's stick to DAG.
            # Actually, condition branches merge back. Visited check per-path is complex.
            # Simplified: Execute node.
            
            node = nodes.get(current_id)
            if not node: continue
            
            print(f"Processing Node {current_id}")
            result_handle = self._execute_step(node, workflow_id, step_index)
            step_index += 1
            
            # Find next nodes based on result_handle
            # If result_handle is None, we follow all edges (normal path)
            # If result_handle is "true", we follow "sourceHandle" == "true"
            
            if current_id in adjacency_list:
                for target_id, source_handle in adjacency_list[current_id]:
                    # Condition Logic:
                    if result_handle:
                        # Only follow edge if handle matches
                        if source_handle == result_handle:
                             queue.append(target_id)
                    else:
                        # Follow all edges (default behavior)
                        queue.append(target_id)
                        
        print(f"Workflow {workflow.name} completed successfully.")
        self._emit_event("workflow_finish", workflow_id, {"status": "success"})

    def _execute_step(self, step, workflow_id, index):
        step_id = step.get("id")
        step_type = step.get("type", "unknown")
        # ReactFlow stores custom data in 'data'
        data_payload = step.get("data", {})
        label = data_payload.get("label") or step.get("label", "Unnamed Step") # fallback for old nodes
        
        print(f"  -> Executing Step {step_id}: {label} ({step_type})")
        self._emit_event("step_start", workflow_id, {"step_id": step_id, "label": label, "index": index})
        
        result_handle = None # Default: follow all paths
        
        try:
            result_data = {}
            if step_type == "actionNode": # Use exact types from FlowEditor
                 # Identify action subtype
                 action_type = data_payload.get("actionType", "unknown")
                 
                 if action_type == "http-request":
                    url = data_payload.get('url')
                    method = data_payload.get('method', 'GET')
                    body = data_payload.get('body')
                    headers = data_payload.get('headers', {})
                    
                    print(f"     Sending {method} Request to {url}")
                    if url:
                        response = httpx.request(method, url, json=body, headers=headers, timeout=10.0)
                        print(f"     Response Status: {response.status_code}")
                        result_data = {"status_code": response.status_code}
                 
                 elif action_type == "slack-notification":
                     webhook_url = data_payload.get('webhook_url') or data_payload.get('url') # handle legacy keys
                     message = data_payload.get('message', 'Default notification message')
                     channel = data_payload.get('channel')
                     
                     if webhook_url:
                         print(f"     Sending Slack Notification to {webhook_url}")
                         httpx.post(webhook_url, json={"text": message, "channel": channel}, timeout=5.0)
                         result_data = {"sent": True}
                     else:
                         print("     [Warn] No webhook_url for slack")
            
            elif step_type == "conditionNode":
                # Check for a 'condition' field in the node data (default to True)
                # In a real app, this would evaluate an expression like "status_code == 200"
                # For now, we look for a boolean flag or string "true"/"false"
                condition_value = data_payload.get("condition", True)
                
                # Normalize to boolean
                if isinstance(condition_value, str):
                    condition_met = condition_value.lower() == "true"
                else:
                    condition_met = bool(condition_value)

                result_handle = "true" if condition_met else "false"
                print(f"     Condition Outcome: {result_handle}")

            elif step_type == "triggerNode":
                 print("     Trigger fired.")
            
            else:
                 print(f"     Unknown step type: {step_type}") # Legacy check
            
            self._emit_event("step_finish", workflow_id, {"step_id": step_id, "status": "success", "result": result_data})

        except Exception as e:
            print(f"     [Error] Step failed: {e}")
            self._emit_event("step_finish", workflow_id, {"step_id": step_id, "status": "error", "error": str(e)})
        
        print(f"     Step {step_id} finished.")
        return result_handle
