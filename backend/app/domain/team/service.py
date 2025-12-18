from sqlalchemy.orm import Session
from app.domain.team.models import Team, UserTeam, TeamRole
from app.domain.team.schemas import TeamCreate, TeamMemberAdd
from app.domain.user.models import User
import secrets

class TeamService:
    def create_team(self, db: Session, team_in: TeamCreate, owner_id: int):
        # Generate a slug from name (simplified)
        slug = team_in.name.lower().replace(" ", "-")
        # Ensure unique slug (basic check, minimal collision handling for MVP)
        existing = db.query(Team).filter(Team.slug == slug).first()
        if existing:
            slug = f"{slug}-{secrets.token_hex(2)}"

        db_team = Team(
            name=team_in.name,
            description=team_in.description,
            slug=slug
        )
        db.add(db_team)
        db.commit()
        db.refresh(db_team)

        # Add owner
        self.add_member_internal(db, db_team.id, owner_id, TeamRole.owner)
        
        return db_team

    def add_member_internal(self, db: Session, team_id: int, user_id: int, role: TeamRole):
        member = UserTeam(user_id=user_id, team_id=team_id, role=role.value)
        db.add(member)
        db.commit()
        return member

    def get_user_teams(self, db: Session, user_id: int):
        return db.query(Team).join(UserTeam).filter(UserTeam.user_id == user_id).all()

    def get_team(self, db: Session, team_id: int):
        return db.query(Team).filter(Team.id == team_id).first()

    def add_member_by_email(self, db: Session, team_id: int, user_email: str, role: str):
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            return None # Or raise exception
        
        # Check if already member
        existing = db.query(UserTeam).filter(UserTeam.team_id == team_id, UserTeam.user_id == user.id).first()
        if existing:
            return existing
            
        role_enum = TeamRole(role) if role in TeamRole._value2member_map_ else TeamRole.member
        return self.add_member_internal(db, team_id, user.id, role_enum)
