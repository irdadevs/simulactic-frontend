import { donationApi } from "./donation.api";
import { logApi } from "./log.api";
import { metricApi } from "./metric.api";
import { userApi } from "./user.api";

export const adminApi = {
  users: userApi,
  logs: logApi,
  metrics: metricApi,
  donations: donationApi,
};
