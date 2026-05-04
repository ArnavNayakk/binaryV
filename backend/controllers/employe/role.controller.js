import RoleModel from "../../models/admin/role.model.js";

// Add a new role
const addRole = async (req, res, next) => {
  try {
    const userId = req?.user?.id;
    const { role, description } = req?.body  || {};
    const roleData = new RoleModel({ role, description, createdBy:userId });
    await roleData.save();
    res.status(201).json({ success: true, message: "New role added",roleData });
  } catch (error) {
    next(error)
  }
};

const getRole = async (req, res, next) => {
  try {
    const userId = req?.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Missing Data" });
    }
    const roles = await RoleModel.find();
    res.status(200).json({ success: true, message: "Roles" ,roles});
  } catch (error) {
    next(error)
  }
};

export { addRole, getRole };
