namespace GraffyApi.Contracts;

public record GraphNodeDto(
    string Id,
    string Type,
    string Label,
    string Color,
    int Xp,
    string Shape
);

public record GraphLinkDto(
    string Source,
    string Target
);

public record GraphResponse(
    List<GraphNodeDto> Nodes,
    List<GraphLinkDto> Links
);
