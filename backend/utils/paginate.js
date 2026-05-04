const paginate = async (Model, page = 1, limit = 10, sort = { createdAt: -1 }) => {
  const skip = (page - 1) * limit;

  const total = await Model.countDocuments();
  const data = await Model.find()
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data,
  };
};

export default paginate;
