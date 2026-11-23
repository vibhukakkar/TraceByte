function getUsers(req, res) {
    res.json({ message: "Users fetched successfully" });
}

function createUser(req, res) {
    res.status(201).json({ message: "User created" });
}

function updateUser(req, res) {
    res.json({ message: "User updated" });
}

function deleteUser(req, res) {
    res.json({ message: "User deleted" });
}

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser
};