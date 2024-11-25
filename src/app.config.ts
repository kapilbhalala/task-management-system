export type Database = {
  uri: string;
};

export default (): Database => {
  return {
    uri: process.env.DATABASE_URI ?? 'mongodb://localhost:27017/TestDB',
  };
};
