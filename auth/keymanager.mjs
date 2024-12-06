const isValidApiKey = (apiKey) => {
  const validApiKeys = [
      process.env.API_KEY_1,
      process.env.API_KEY_2,
      process.env.API_KEY_3,
  ];

  return validApiKeys.includes(apiKey);
};

export default isValidApiKey;
