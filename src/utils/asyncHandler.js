//Higher order func: func কে as a parameter হিসেবে pass & return করতে পারে। অর্থাৎ fun as a variable treat করে।
//Syntax: () => () => {}
//explanation: () => {() => {}} arrow fun এর ভিতর আবার arrow fun & code লেখার সময় {} বাদ দেই।

//Promises:
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

/*Try-catch:
const asynchandler = (fn) => async (req, res, next) => {
  try {
    await fn(req,res,next)

  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};
*/
