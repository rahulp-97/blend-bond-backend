
const errorMessages = {
    userExists: "User already registered! Please login to your account.",
    noUsersFound: "No users found.",
    failedToFetchUsers: "Failed to fetch users",
    invalidUserIdToDelete: "couldn't delete user due to invalid user id.",
    unableToDeleteUser: "Server error while deleting the user.",
    invaldUserIdToUpdate: "couldn't update user due to invalid user id.",
    invaldUserDataToUpdate: "couldn't update user due to invalid user data.",
    failedToUpdateUser: "Faild to update the user",
    updateNotAllowed: "Updates are not allowed.",
    maxHobbisReached: "Can't add more than 10 hobbies",
    loginError: "An error occured while logging you in! ",
    userNotFound: "Looks like you haven't created account yet, Please register yourself first.",
    incorrectPassword: "Incorrect password! Please try again with the correct password.",
    noToken: "Unauthorized user request.",
    inValidTokenValue: "invalid user identifier.",
    fetchProfileError: "Couldn't load the user profile, ",
    authUserNotFound: "Invalid user authentication.",
    logoutError: "Technical server error while logging you out, Please try again.",
    toUserNotFound: "Invalid user id, couldn't found end user.",
    endUserNotFound: "End user not found.",
    connectionRequestFailed: "Couldn't send the connection request.",
    inValidRequestStatusType: "Invalid request status.",
    requestExists: "request already exists.",
    sameToAndFromUsers: "Invalid connection request operation, Found sender as a reciever.",
    sendRequestError: "Error while sending request.",
    invalidReqId: "Invalid request identifier found while reviewing the request.",
    noRequestFound: "No connection request found, Please review the valid request.",
};

const messages = {
    registrationSucceed: "You have rgistered yourself successfully, Now please verify your registered email.",
    fetchUsers: "Users fetched successfully",
    deletedUser: "User deleted successfully.",
    updatedUser: "User updated successfully.",
    loggedin: "User loggedin successfully.",
    getProfileSucceed: "User profile fetched successfully.",
    loggedOut: "User logged out successfully.",
    connectionRequestSent: "Connection request sent successfully to",
    connectionReqReviewed: "You have | the request successfully.",
    getRequests: "Requests fetched successfully.",
    noRequests: "You don't have any connection request as of now.",
    noConnections: "You don't have any connections, let's explore feed & make new connections.",
    getConnections: "Connections fetched successfully."
}

module.exports = { messages, errorMessages };