namespace GraffyApi.Common;

public static class DateTimeHelper
{
    // PostgreSQL timestamptz accepts only UTC; dates from the frontend arrive with Kind=Unspecified.
    public static DateTime? ToUtc(DateTime? d) =>
        d.HasValue ? DateTime.SpecifyKind(d.Value, DateTimeKind.Utc) : null;
}
