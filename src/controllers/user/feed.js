const mongoose = require("mongoose");
const User = require("../../models/user");
const ConnectionRequest = require("../../models/connectionRequest");

const feed = async (req, res) => {
    try {
        const loggedInUser = req.user;
        const loggedInUserId = loggedInUser?._id?.toString();

        let page = Math.abs(parseInt(req.query.page)) || 1;
        let limit = Math.abs(parseInt(req.query.limit)) || 10;

        // avoid limit if more than 20:
        limit = (limit > 20) ? 20 : limit;
        let skip = (page-1) * limit;

        const excludedUsers = await ConnectionRequest.find({
            $or: [
                {
                    fromUserId: loggedInUserId,
                    $or: [
                        { status: "interested" },
                        { status: "accepted" }
                    ]
                },
                {
                    toUserId: loggedInUserId,
                    $or: [
                        { status: "interested" },
                        { status: "accepted" }
                    ]
                }
            ]
        });


        const excludedUsersData = excludedUsers?.map(req => {
            const userId = req?.fromUserId?.toString();
            if(userId === loggedInUserId) {
                return req?.toUserId?.toString()
            } else {
                return req?.fromUserId?.toString()
            }
        });

        const excludedUserIds = [loggedInUserId, ...excludedUsersData];

        const feedData = await User.find({
            _id: { $nin: excludedUserIds}
        }).skip(skip).limit(limit);

        const feed = feedData?.map(user => {
            const { _id, firstName, lastName, age, gender, photoUrl, hobbies, about} = user;
            return { _id, firstName, lastName, age, gender, photoUrl, hobbies, about};
        });

        return res.json({
            status: "success",
            message: "feed",
            data: feed
        })
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error?.message || error?.error
        })
    }
};

module.exports = feed;