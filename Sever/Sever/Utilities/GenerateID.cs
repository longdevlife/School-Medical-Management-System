namespace Sever.Utilities
{
    public static class GenerateID
    {
        public static string GenerateNextId(string currentId, string prefix, int numberLength)
        {
            if (string.IsNullOrEmpty(currentId) || !currentId.StartsWith(prefix))
            {
                return prefix + new string('0', numberLength - 1) + "1";
            }
            string numberPart = currentId.Substring(prefix.Length);

            if (int.TryParse(numberPart, out int number))
            {
                number++;
                return prefix + number.ToString().PadLeft(numberLength, '0');
            }
            return prefix + new string('0', numberLength - 1) + "1";
        }
    }
}
