import { HttpService } from "./http.service";

interface HttpModule {
  httpService: HttpService;
}

const API_BASE_URL = "/api/v1";

export const buildModule = (): HttpModule => {
  const httpService = new HttpService({ baseURL: API_BASE_URL });
  return {
    httpService,
  };
};

export { HttpService } from "./http.service";
export { HttpStatusCode } from "./http.types";