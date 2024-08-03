import 'dotenv/config';

console.log('Current NODE_ENV:', process.env.NODE_ENV);
console.log('Current BASE_URL:', process.env.BASE_URL);
console.log('Current ENVFILE:', process.env.ENVFILE);

export default ({ config }) => {
  return {
    ...config,
    extra: {
      API_BASE_URL: process.env.BASE_URL,
      ENVIRONMENT: process.env.NODE_ENV
    },
  };
};
