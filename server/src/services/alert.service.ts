import { Alert } from "../models/Alert";
import type { AlertCondition } from "../models/Alert";

export async function getAlerts(userId: string) {
  return Alert.find({ userId }).sort({ createdAt: -1 });
}

export async function createAlert(
  userId: string,
  symbol: string,
  condition: AlertCondition,
  targetPrice: number
) {
  return Alert.create({
    userId,
    symbol: symbol.toUpperCase(),
    condition,
    targetPrice,
  });
}

export async function toggleAlert(userId: string, alertId: string) {
  const alert = await Alert.findOne({ _id: alertId, userId });
  if (!alert) {
    throw Object.assign(new Error("Alert not found"), { status: 404 });
  }
  alert.active = !alert.active;
  await alert.save();
  return alert;
}

export async function deleteAlert(userId: string, alertId: string) {
  const alert = await Alert.findOneAndDelete({ _id: alertId, userId });
  if (!alert) {
    throw Object.assign(new Error("Alert not found"), { status: 404 });
  }
  return alert;
}