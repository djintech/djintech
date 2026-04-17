export default () => ({
  database: {
    url: process.env.PAYMENTS_DB_URL,
    logging: true,
  },
});
