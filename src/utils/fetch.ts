import axios, { Axios, AxiosRequestConfig } from "axios";

export default function (input: AxiosRequestConfig) {
  // const fetch = new Axios({
  //   ...input,
  //   transitional: {forcedJSONParsing: true, silentJSONParsing: true},
  //   validateStatus: function (status) {
  //     return status >= 200 && status < 300; // default
  //   },
  // });
  const fetch = axios;
  fetch.interceptors.request.use((config) => {
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  fetch.interceptors.response.use(function (response) {
    return response;
  }, function (error) {
    const customError = { message: error?.response?.data.message, status:error?.response?.data.statusCode };
    return Promise.reject(customError);
  });

  return fetch;
};