from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel


class ChemicalTreatment(BaseModel):
    product: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None


class DiagnosisDetail(BaseModel):
    disease_name: str
    confidence: float
    severity: str
    description: str
    organic_treatment: List[str] = []
    chemical_treatment: Optional[ChemicalTreatment] = None
    prevention: List[str] = []


class DiagnosisResponse(BaseModel):
    crop_identified: str
    overall_health: str
    diagnoses: List[DiagnosisDetail] = []
    should_escalate_to_expert: bool = False
    urgency: str = "low"
    image_path: str
