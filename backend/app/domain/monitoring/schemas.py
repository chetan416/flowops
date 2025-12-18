from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class EndpointBase(BaseModel):
    name: str
    url: str
    method: str = "GET"
    expected_status: int = 200
    check_interval: int = 60

class EndpointCreate(EndpointBase):
    pass

class EndpointResponse(EndpointBase):
    id: int
    service_id: int
    is_active: bool
    latest_check_success: Optional[bool] = None
    
    class Config:
        from_attributes = True

class MonitoredServiceBase(BaseModel):
    name: str
    description: Optional[str] = None

class MonitoredServiceCreate(MonitoredServiceBase):
    endpoints: Optional[List[EndpointCreate]] = []

class MonitoredServiceResponse(MonitoredServiceBase):
    id: int
    status: str
    created_at: datetime
    endpoints: List[EndpointResponse] = []

    class Config:
        from_attributes = True
