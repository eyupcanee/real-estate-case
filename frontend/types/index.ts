import { TransactionStage } from "../enums";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  statusCode?: number;
}

export interface FinancialBreakdown {
  agencyCut: number;
  listingAgentCut: number;
  sellingAgentCut: number;
}

export interface Property {
  _id: string;
  title: string;
  location: string;
  price: number;
  type: string;
}

export interface Agent {
  _id: string;
  fullName: string;
  email: string;
}

export interface Transaction {
  _id: string;
  propertyId: Property | string;
  listingAgentId: Agent | string;
  sellingAgentId: Agent | string;
  stage: TransactionStage;
  totalServiceFee: number;
  financialBreakdown?: FinancialBreakdown;
  createdAt: string;
  updatedAt: string;
}
