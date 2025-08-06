class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async findAll(filter = {}, options = {}) {
        const { limit = 10, page = 1, sort = {} } = options;
        const skip = (page - 1) * limit;
        return await this.model.find(filter).sort(sort).skip(skip).limit(limit);
    }

    async findById(id) {
        return await this.model.findById(id);
    }

    async findOne(filter) {
        return await this.model.findOne(filter);
    }

    async create(data) {
        const entity = new this.model(data);
        return await entity.save();
    }

    async update(id, data) {
        return await this.model.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id) {
        return await this.model.findByIdAndDelete(id);
    }

    async count(filter = {}) {
        return await this.model.countDocuments(filter);
    }

    async exists(filter) {
        return await this.model.exists(filter);
    }
}

module.exports = BaseRepository; 