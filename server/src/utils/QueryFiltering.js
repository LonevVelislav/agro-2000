class QueryFiltering {
    constructor(query, requestQuery) {
        this.query = query;
        this.requestQuery = requestQuery;
    }

    filter() {
        const queryCopy = { ...this.requestQuery };
        const excludedFields = ["page", "sort", "limit", "fields"];
        excludedFields.forEach((el) => delete queryCopy[el]);

        let queryString = JSON.stringify(queryCopy);

        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/, (match) => `$${match}`);
        this.query = this.query.find(JSON.parse(queryString));

        return this;
    }

    sort() {
        if (this.requestQuery.sort) {
            const sortedBy = this.requestQuery.sort.split(",").join(" ");
            this.query.sort(sortedBy);
        } else {
            this.query.sort("-createdAt");
        }
        return this;
    }

    filterFields() {
        if (this.requestQuery.fields) {
            const fields = this.requestQuery.fields.split(",").join(" ");
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select("-__v");
        }
        return this;
    }

    paginate() {
        const page = this.requestQuery.page * 1 || 1;
        const limit = this.requestQuery.limit * 1 || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = QueryFiltering;
