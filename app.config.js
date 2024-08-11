import 'dotenv/config';

console.log('Current NODE_ENV:', process.env.NODE_ENV);
console.log('Current BASE_URL:', process.env.BASE_URL);
console.log('Current ENVFILE:', process.env.ENVFILE);

export default ({ config }) => {
  return {
    ...config,
    extra: {
      API_BASE_URL: process.env.BASE_URL,
      ENVIRONMENT: process.env.NODE_ENV,
      eas: {
        projectId: "88ad983d-5ca3-44e6-bc1b-8a9a941af992"
      }
    },
  };
};
