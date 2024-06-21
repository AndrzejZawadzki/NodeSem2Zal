class Ad {
  constructor(title, description, author, category, tags, price, userId) {
    this.id = Ad.incrementId();
    this.title = title;
    this.description = description;
    this.author = author;
    this.category = category;
    this.tags = tags;
    this.price = price;
    this.createdAt = new Date();
    this.userId = userId;
  }

  static incrementId() {
    if (!this.latestId) this.latestId = 1;
    else this.latestId++;
    return this.latestId;
  }

  toString() {
    return `ID: ${this.id}\nTitle: ${this.title}\nDescription: ${
      this.description
    }\nAuthor: ${this.author}\nCategory: ${
      this.category
    }\nTags: ${this.tags.join(", ")}\nPrice: ${this.price}\nCreated At: ${
      this.createdAt
    }\nUserId: ${this.userId}`;
  }
}

module.exports = Ad;
