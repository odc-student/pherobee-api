const createApiResponse = (responseBody,statusCode=200, message="Request was successful", success=true)=> {
  return {
    header: {
      status_code: statusCode,
      message: message,
      success: success,
    },
    body: responseBody,
  };
}

module.exports ={
  createApiResponse
}
