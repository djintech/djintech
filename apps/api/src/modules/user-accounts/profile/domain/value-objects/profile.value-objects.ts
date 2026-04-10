export const firstOrLastNameConstraints = {
  minLength: 1,
  maxLength: 50,
  match: '^[A-Za-zА-Яа-яЁё\\s-]+$'
};

export const aboutMeConstraints = {
  maxLength: 200
};

export const countryOrCityConstraints = {
  maxLength: 100,
};