import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'SoftE-BE API',
    description: 'Automatically generated Swagger documentation',
  },
  host: 'localhost:3000',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['../server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);