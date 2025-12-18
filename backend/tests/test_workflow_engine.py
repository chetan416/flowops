import pytest
from app.services.workflow_engine import WorkflowEngine
from app.domain.workflow.models import Workflow

# Mock Redis to avoid needing a real Redis connection in unit tests if possible,
# or rely on the docker container having redis (which it does).
# But WorkflowEngine inits Redis in __init__. 
# We should probably mock it to avoid side effects or dependency on Redis for unit logic.

class MockRedis:
    def __init__(self, url=None):
        pass
    def publish(self, channel, message):
        pass
    @classmethod
    def from_url(cls, url):
        return cls()

# Patch redis in the module
import app.services.workflow_engine
app.services.workflow_engine.redis = MockRedis

def test_workflow_engine_graph_traversal():
    engine = WorkflowEngine()
    
    # Create a Mock Workflow with a Graph
    # Trigger -> Condition -> (True: Action1) / (False: Action2)
    
    steps_data = {
        "nodes": [
            {"id": "1", "type": "triggerNode", "data": {"label": "Start"}},
            {"id": "2", "type": "conditionNode", "data": {"label": "Check", "condition": "true"}},
            {"id": "3", "type": "actionNode", "data": {"label": "True Action", "actionType": "slack-notification"}},
            {"id": "4", "type": "actionNode", "data": {"label": "False Action", "actionType": "http-request"}}
        ],
        "edges": [
            {"source": "1", "target": "2", "sourceHandle": None},
            {"source": "2", "target": "3", "sourceHandle": "true"},
            {"source": "2", "target": "4", "sourceHandle": "false"}
        ]
    }
    
    # We need to mock the DB object because execute_workflow relies on it to fetch the workflow.
    # But execute_workflow is an integration method usually.
    # Let's subclass or mock the DB session.
    
    class MockWorkflow:
        id = 999
        name = "Test Flow"
        steps = [steps_data] # The JSON column
    
    class MockDB:
        def query(self, model):
            return self
        def filter(self, *args):
            return self
        def first(self):
            return MockWorkflow()
            
    # Capture print output or mock _execute_step to verify order?
    # Better: Inspect what `_execute_step` receives.
    # But `_execute_step` is internal. 
    # Let's override `_execute_step` in a subclass for verification.
    
    executed_steps = []
    
    class TestableEngine(WorkflowEngine):
        def _execute_step(self, step, workflow_id, index):
            executed_steps.append(step['id'])
            # Call original to process logic (like condition evaluation)
            return super()._execute_step(step, workflow_id, index)
            
    test_engine = TestableEngine()
    test_engine.execute_workflow(MockDB(), 999)
    
    # Expected execution: 1 -> 2 -> 3 (because condition is "true")
    # Node 4 should NOT be executed.
    
    assert "1" in executed_steps
    assert "2" in executed_steps
    assert "3" in executed_steps
    assert "4" not in executed_steps
    
    print("Graph Traversal Test Passed!")

def test_workflow_engine_condition_false():
    # Same setup but condition = false
    steps_data = {
        "nodes": [
            {"id": "1", "type": "triggerNode", "data": {"label": "Start"}},
            {"id": "2", "type": "conditionNode", "data": {"label": "Check", "condition": "false"}},
            {"id": "3", "type": "actionNode", "data": {"label": "True Action", "actionType": "slack-notification"}},
            {"id": "4", "type": "actionNode", "data": {"label": "False Action", "actionType": "http-request"}}
        ],
        "edges": [
            {"source": "1", "target": "2", "sourceHandle": None},
            {"source": "2", "target": "3", "sourceHandle": "true"},
            {"source": "2", "target": "4", "sourceHandle": "false"}
        ]
    }
    
    class MockWorkflow:
        id = 999
        name = "Test Flow False"
        steps = [steps_data]
        
    class MockDB:
        def query(self, model): return self
        def filter(self, *args): return self
        def first(self): return MockWorkflow()
        
    executed_steps = []
    class TestableEngine(WorkflowEngine):
        def _execute_step(self, step, workflow_id, index):
            executed_steps.append(step['id'])
            return super()._execute_step(step, workflow_id, index)
            
    test_engine = TestableEngine()
    test_engine.execute_workflow(MockDB(), 999)
    
    assert "1" in executed_steps
    assert "2" in executed_steps
    assert "4" in executed_steps  # False path
    assert "3" not in executed_steps # True path
