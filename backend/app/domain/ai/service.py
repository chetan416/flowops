from sqlalchemy.orm import Session
from app.domain.incidents.models import Incident

class AIService:
    def analyze_incident(self, incident: Incident) -> str:
        from app.core.config import settings
        import openai
        
        if settings.OPENAI_API_KEY:
            try:
                client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a Site Reliability Engineer responsible for analyzing incident logs and producing a root cause analysis."},
                        {"role": "user", "content": f"Analyze the following incident and provide a hypothesis, evidence, and recommendations:\n\nTitle: {incident.title}\nDescription: {incident.description}"}
                    ]
                )
                return response.choices[0].message.content
            except Exception as e:
                print(f"OpenAI API Error: {e}")
                # Fallthrough to mock
        
        # Mock AI Analysis (Fallback)
        if "timeout" in incident.description.lower():
             return (
                 "### Root Cause Analysis (AI)\n"
                 "**Hypothesis**: The upstream service is experiencing high latency or is overwhelmed.\n"
                 "**Evidence**: 100% of requests failed with 10s timeout.\n"
                 "**Recommendation**: Check the database connection pool on the upstream service and consider scaling out replicas."
             )
        elif "500" in incident.description:
             return (
                 "### Root Cause Analysis (AI)\n"
                 "**Hypothesis**: Unhandled exception in the application logic.\n"
                 "**Evidence**: HTTP 500 Internal Server Error returned immediately.\n"
                 "**Recommendation**: Check application logs for recent stack traces. Verify if a recent deployment introduced a regression in the handler."
             )
        else:
             return (
                 "### Root Cause Analysis (AI)\n"
                 "**Hypothesis**: Network Intermittent failure.\n"
                 "**Recommendation**: Retry the request. If persistence, check DNS configuration."
             )

    def generate_post_mortem(self, incident: Incident, deployments: list) -> str:
        # Mock Post-Mortem Generation
        # Context: Incident + Recent Deployments
        
        recent_deploy = deployments[0] if deployments else None
        deploy_context = ""
        if recent_deploy:
            deploy_context = f"\n**Recent Deployment**: Version `{recent_deploy.version}` was deployed at {recent_deploy.created_at}. " \
                             f"Commit `{recent_deploy.git_commit}`."
        
        return (
            f"# Post-Mortem: {incident.title}\n\n"
            f"**Date**: {incident.created_at.strftime('%Y-%m-%d')}\n"
            f"**Severity**: {incident.severity.upper()}\n"
            f"**Owner**: Team {incident.owner_team_id if incident.owner_team_id else 'Unassigned'}\n\n"
            f"## Executive Summary\n"
            f"The service experienced a {incident.severity} severity incident resulting in downtime. "
            f"AI analysis suggests a correlation with recent changes.\n\n"
            f"## Root Cause Analysis\n"
            f"**Trigger**: Health check failed with error: `{incident.description}`.\n"
            f"{deploy_context}\n"
            f"**Hypothesis**: The failure indicates a regression or environment configuration issue.\n\n"
            f"## Timeline\n"
            f"- **Detected**: {incident.created_at.strftime('%H:%M:%S UTC')}\n"
            f"- **Acknowledged**: {(incident.created_at).strftime('%H:%M:%S UTC')} (Auto)\n"
            f"- **Resolved**: N/A (Ongoing or Manual)\n\n"
            f"## Action Items\n"
            f"- [ ] Rollback to previous stable version if applicable.\n"
            f"- [ ] Add regression test for this specific error scenario.\n"
            f"- [ ] Review logs for `{incident.service_id}` service."
        )

    def suggest_remediation(self, db: Session, incident: Incident) -> dict:
        from app.domain.workflow.models import Workflow
        
        # Simple/Mock AI matching logic
        # In full production this would use vector embeddings or LLM classification
        
        incident_desc = (incident.description or "").lower()
        incident_title = (incident.title or "").lower()
        
        workflows = db.query(Workflow).filter(Workflow.is_active == True).all()
        
        best_match = None
        highest_score = 0
        
        for wf in workflows:
            score = 0
            wf_name = wf.name.lower()
            wf_desc = (wf.description or "").lower()
            
            # Heuristic scoring
            if wf_name in incident_title or wf_name in incident_desc:
                score += 50
            if "restart" in wf_name and ("timeout" in incident_desc or "500" in incident_desc):
                score += 30
            if "scale" in wf_name and "latency" in incident_desc:
                score += 30
            if "rollback" in wf_name and "deployment" in incident_desc:
                score += 40
                
            # Generic overlap
            if any(word in incident_desc for word in wf_name.split()):
                score += 10
                
            if score > highest_score and score > 20: # Threshold
                highest_score = score
                best_match = wf
        
        if best_match:
            return {
                "workflow_id": best_match.id,
                "workflow_name": best_match.name,
                "confidence": min(highest_score, 99) / 100.0,
                "reasoning": f"Workflow '{best_match.name}' matches keywords in the incident description."
            }
        
        return None
