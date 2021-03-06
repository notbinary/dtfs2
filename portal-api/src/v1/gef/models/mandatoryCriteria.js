class MandatoryCriteria {
  constructor(req) {
    this.version = req.version;
    this.isInDraft = req.isInDraft;
    this.title = req.title;
    this.htmlText = req.htmlText;
    this.createdAt = Date.now();
    this.updatedAt = null;
  }
}

module.exports = {
  MandatoryCriteria,
};
