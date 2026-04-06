import axios from "axios";
import { ELEVATOR_MONITOR_API_BASE_URL } from "@/config/elevatorMonitor";

export const elevatorMonitorApi = axios.create({
  baseURL: ELEVATOR_MONITOR_API_BASE_URL,
});
