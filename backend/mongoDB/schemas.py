# Takes in a user and returns it as a dictionary 

def user_serializer(user) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "todayStudyTime": user["todayStudyTime"],
        "todayDistractions": user["todayDistractions"],
        "thisWeek": user["thisWeek"],
        "weeklyAverages": user["weeklyAverages"],
        "totalStudyTime": user["totalStudyTime"]
    }

# Takes all of the users, turn them into dictionaries and returns them as a list

def users_serializer(users) -> list:
    return [user_serializer(user) for user in users]