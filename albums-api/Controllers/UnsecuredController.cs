using Microsoft.Data.SqlClient;
using System.Data;
using System.Text;

namespace UnsecureApp.Controllers
{
    /// <summary>
    /// Provides file and database helper operations.
    /// </summary>
    public class MyController
    {
        private const int ReadBufferSize = 1024;
        private readonly Func<string, FileStream> _fileStreamFactory;
        private readonly string _allowedBaseDirectory;
        private readonly Action<string> _logMessage;

        /// <summary>
        /// Initializes a new instance of the MyController class.
        /// </summary>
        /// <param name="fileStreamFactory">Optional file stream factory used for file access and tests.</param>
        /// <param name="allowedBaseDirectory">Optional base directory used to restrict file reads.</param>
        /// <param name="logMessage">Optional logging callback.</param>
        public MyController(
            Func<string, FileStream>? fileStreamFactory = null,
            string? allowedBaseDirectory = null,
            Action<string>? logMessage = null)
        {
            _fileStreamFactory = fileStreamFactory ?? (path => File.Open(path, FileMode.Open, FileAccess.Read, FileShare.Read));
            _allowedBaseDirectory = EnsureTrailingDirectorySeparator(
                Path.GetFullPath(allowedBaseDirectory ?? Directory.GetCurrentDirectory()));
            _logMessage = logMessage ?? (_ => { });
        }

        /// <summary>
        /// Reads up to the first 1024-byte chunk from a file path provided by user input.
        /// </summary>
        /// <param name="userInput">The file path to open.</param>
        /// <returns>
        /// The UTF-8 decoded text for the first chunk read, or null if the file is empty.
        /// </returns>
        /// <exception cref="ArgumentException">Thrown when userInput is invalid.</exception>
        /// <exception cref="IOException">Thrown when an I/O error occurs while opening or reading the file.</exception>
        /// <exception cref="UnauthorizedAccessException">Thrown when access to the file is denied.</exception>
        public string? ReadFile(string userInput)
        {
            var validatedPath = ValidateUserPath(userInput);
            using FileStream fs = OpenFileStream(validatedPath);
            return ReadFirstChunk(fs);
        }

        /// <summary>
        /// Asynchronously reads up to the first 1024-byte chunk from a file path provided by user input.
        /// </summary>
        /// <param name="userInput">The file path to open.</param>
        /// <param name="cancellationToken">A token used to cancel the asynchronous operation.</param>
        /// <returns>
        /// The UTF-8 decoded text for the first chunk read, or null if the file is empty.
        /// </returns>
        public async Task<string?> ReadFileAsync(string userInput, CancellationToken cancellationToken = default)
        {
            var validatedPath = ValidateUserPath(userInput);
            await using FileStream fs = OpenFileStream(validatedPath);
            return await ReadFirstChunkAsync(fs, cancellationToken);
        }

        /// <summary>
        /// Gets a product ID by product name from the database.
        /// </summary>
        /// <param name="productName">The product name to search for.</param>
        /// <returns>The product ID from the first row in the result set.</returns>
        /// <exception cref="InvalidOperationException">Thrown when the connection or command is not properly initialized.</exception>
        /// <exception cref="SqlException">Thrown when a SQL Server error occurs.</exception>
        /// <remarks>
        /// This method currently builds SQL with string concatenation, which is vulnerable to SQL injection.
        /// Parameterized queries are recommended.
        /// </remarks>
        public int GetProduct(string productName)
        {
            using SqlConnection connection = CreateConnection() ?? throw new InvalidOperationException("Connection is not configured.");
            using SqlCommand sqlCommand = CreateGetProductCommand(connection, productName)
                ?? throw new InvalidOperationException("Command could not be created.");

            connection.Open();
            using SqlDataReader reader = sqlCommand.ExecuteReader();
            return ReadProductId(reader);
        }

        /// <summary>
        /// Asynchronously gets a product ID by product name from the database.
        /// </summary>
        /// <param name="productName">The product name to search for.</param>
        /// <param name="cancellationToken">A token used to cancel the asynchronous operation.</param>
        /// <returns>The product ID from the first row in the result set.</returns>
        public async Task<int> GetProductAsync(string productName, CancellationToken cancellationToken = default)
        {
            using SqlConnection connection = CreateConnection() ?? throw new InvalidOperationException("Connection is not configured.");
            using SqlCommand sqlCommand = CreateGetProductCommand(connection, productName)
                ?? throw new InvalidOperationException("Command could not be created.");

            await connection.OpenAsync(cancellationToken);
            using SqlDataReader reader = await sqlCommand.ExecuteReaderAsync(cancellationToken);
            return await ReadProductIdAsync(reader, cancellationToken);
        }

        /// <summary>
        /// Demonstrates exception handling for a null reference scenario.
        /// </summary>
        public void GetObject()
        {
            object? o = null;
            if (o is null)
            {
                _logMessage("Object was null.");
                return;
            }

            _ = o.ToString();
        }

        /// <summary>
        /// Stores the database connection string used by this controller.
        /// </summary>
        private string connectionString =
            System.Environment.GetEnvironmentVariable("ALBUMS_API_CONNECTION_STRING")
            ?? throw new InvalidOperationException("The ALBUMS_API_CONNECTION_STRING environment variable must be configured.");

        private FileStream OpenFileStream(string userInput)
        {
            return _fileStreamFactory(userInput);
        }

        private string ValidateUserPath(string userInput)
        {
            if (string.IsNullOrWhiteSpace(userInput))
            {
                throw new ArgumentException("A valid file path must be provided.", nameof(userInput));
            }

            var normalizedPath = Path.GetFullPath(userInput);
            if (!normalizedPath.StartsWith(_allowedBaseDirectory, StringComparison.Ordinal))
            {
                throw new UnauthorizedAccessException("Reading files outside the allowed directory is not permitted.");
            }

            return normalizedPath;
        }

        private static string EnsureTrailingDirectorySeparator(string path)
        {
            if (path.EndsWith(Path.DirectorySeparatorChar) || path.EndsWith(Path.AltDirectorySeparatorChar))
            {
                return path;
            }

            return path + Path.DirectorySeparatorChar;
        }

        private static string? ReadFirstChunk(Stream stream)
        {
            byte[] buffer = new byte[ReadBufferSize];
            UTF8Encoding encoding = new UTF8Encoding(true);

            int bytesRead;
            while ((bytesRead = stream.Read(buffer, 0, buffer.Length)) > 0)
            {
                return encoding.GetString(buffer, 0, bytesRead);
            }

            return null;
        }

        private static async Task<string?> ReadFirstChunkAsync(Stream stream, CancellationToken cancellationToken)
        {
            byte[] buffer = new byte[ReadBufferSize];
            UTF8Encoding encoding = new UTF8Encoding(true);

            int bytesRead;
            while ((bytesRead = await stream.ReadAsync(buffer, cancellationToken)) > 0)
            {
                return encoding.GetString(buffer, 0, bytesRead);
            }

            return null;
        }

        private SqlConnection CreateConnection()
        {
            return new SqlConnection(connectionString);
        }

        private static SqlCommand CreateGetProductCommand(SqlConnection connection, string productName)
        {
            var command = new SqlCommand
            {
                Connection = connection,
                CommandText = "SELECT TOP 1 ProductId FROM Products WHERE ProductName = @productName",
                CommandType = CommandType.Text,
            };

            command.Parameters.Add(new SqlParameter("@productName", SqlDbType.NVarChar, 255)
            {
                Value = productName
            });

            return command;
        }

        private static int ReadProductId(SqlDataReader reader)
        {
            if (!reader.Read())
            {
                throw new InvalidOperationException("No product row was returned.");
            }

            return reader.GetInt32(0);
        }

        private static async Task<int> ReadProductIdAsync(SqlDataReader reader, CancellationToken cancellationToken)
        {
            if (!await reader.ReadAsync(cancellationToken))
            {
                throw new InvalidOperationException("No product row was returned.");
            }

            return reader.GetInt32(0);
        }
    }
}