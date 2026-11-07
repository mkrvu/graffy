namespace GraffyApi.Common;

public class ServiceResult
{
    public bool IsSuccess { get; }
    public string? Error { get; }
    public bool IsNotFound { get; }

    protected ServiceResult(bool isSuccess, string? error = null, bool isNotFound = false)
    {
        IsSuccess = isSuccess;
        Error = error;
        IsNotFound = isNotFound;
    }

    public static ServiceResult Success() => new(true);
    public static ServiceResult Failure(string error) => new(false, error);
    public static ServiceResult NotFound() => new(false, "Не найдено", true);
}

public sealed class ServiceResult<T> : ServiceResult
{
    public T? Data { get; }

    private ServiceResult(T data) : base(true) => Data = data;
    private ServiceResult(string error, bool isNotFound = false) : base(false, error, isNotFound) { }

    public static ServiceResult<T> Success(T data) => new(data);
    public static new ServiceResult<T> Failure(string error) => new(error);
    public static new ServiceResult<T> NotFound() => new("Не найдено", true);
}
