export const usernameConstraints = {
  minLength: 6,
  maxLength: 30,
  match: /^[a-zA-Z0-9_-]*$/,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
  match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!"#$%&'()*+,\-./:;<=>?@[\\\]^_{|}~]{6,20}$/,
};

export const emailConstraints = {
  minLength: 5,
  maxLength: 500,
  match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
};
