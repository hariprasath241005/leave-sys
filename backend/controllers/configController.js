const Config = require("../models/Config");

exports.getConfig = async (req, res) => {
  let config = await Config.findOne();
  if (!config) config = await Config.create({});
  res.json(config);
};

exports.updateConfig = async (req, res) => {
  let config = await Config.findOne();
  if (!config) config = await Config.create({});
  
  if (req.body.managerLimit !== undefined) config.managerLimit = req.body.managerLimit;
  if (req.body.hrLimit !== undefined) config.hrLimit = req.body.hrLimit;
  if (req.body.ceoLimit !== undefined) config.ceoLimit = req.body.ceoLimit;

  await config.save();
  res.json(config);
};
