namespace GaneshChanda.Api.Services;

public static class FaceImageStorage
{
    public static string Save(string webRoot, string dataUrl)
    {
        var (bytes, extension) = Decode(dataUrl);
        if (bytes.Length < 2_000)
        {
            throw new InvalidOperationException("The face photo is too small. Capture a clearer image.");
        }

        if (bytes.Length > 900_000)
        {
            throw new InvalidOperationException("The face photo is too large. Capture again and try once more.");
        }

        var folder = Path.Combine(webRoot, "login-faces");
        Directory.CreateDirectory(folder);
        var fileName = $"{Guid.NewGuid():N}.{extension}";
        File.WriteAllBytes(Path.Combine(folder, fileName), bytes);
        return $"/login-faces/{fileName}";
    }

    private static (byte[] Bytes, string Extension) Decode(string dataUrl)
    {
        if (string.IsNullOrWhiteSpace(dataUrl))
        {
            throw new InvalidOperationException("A face photo is required to sign in.");
        }

        var payload = dataUrl.Trim();
        var comma = payload.IndexOf(',');
        if (payload.StartsWith("data:", StringComparison.OrdinalIgnoreCase) && comma > 0)
        {
            payload = payload[(comma + 1)..];
        }

        byte[] bytes;
        try
        {
            bytes = Convert.FromBase64String(payload);
        }
        catch (FormatException)
        {
            throw new InvalidOperationException("The face photo could not be read. Capture it again.");
        }

        if (bytes.Length >= 3 && bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF)
        {
            return (bytes, "jpg");
        }

        if (bytes.Length >= 8 &&
            bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47)
        {
            return (bytes, "png");
        }

        throw new InvalidOperationException("Capture a JPEG or PNG photo of the person signing in.");
    }
}
