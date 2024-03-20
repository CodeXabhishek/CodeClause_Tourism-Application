class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // const queryObj = { ...this.queryString };
    const queryObj = Object.assign({}, { ...this.queryString });
    const excludeField = ['page', 'sort', 'limit', 'fields'];
    excludeField.forEach((ele) => delete queryObj[ele]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(lt|lte|gt|gte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortString = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortString);
    }
    // else{query= query.sort('-price')}
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
