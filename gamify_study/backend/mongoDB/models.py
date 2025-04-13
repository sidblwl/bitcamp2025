from pydantic import BaseModel, Field
from typing import Dict, List

class User(BaseModel):
    name: str
    todayStudyTime: int
    todayDistractions: int
    thisWeek: Dict[str, List[int]] = Field(
        default_factory=lambda: {
            "Monday": [0, 0],
            "Tuesday": [0, 0],
            "Wednesday": [0, 0],
            "Thursday": [0, 0],
            "Friday": [0, 0],
            "Saturday": [0, 0],
            "Sunday": [0, 0],
        }
    )
    weeklyAverages: Dict[str, List[int]] = Field(
        default_factory=lambda: {
            "Monday": [0, 0],
            "Tuesday": [0, 0],
            "Wednesday": [0, 0],
            "Thursday": [0, 0],
            "Friday": [0, 0],
            "Saturday": [0, 0],
            "Sunday": [0, 0],
        }
    )
    totalStudyTime: int

    
    