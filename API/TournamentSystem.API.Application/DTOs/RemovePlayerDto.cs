namespace UmaMusumeTournamentMaker.API.Application.DTOs
{
    /// <summary>
    /// DTO for removing a player from a tournament
    /// </summary>
    public class RemovePlayerDto
    {
        /// <summary>
        /// Tournament ID
        /// </summary>
        public int TournamentId { get; set; }

        /// <summary>
        /// Player ID to remove
        /// </summary>
        public int PlayerId { get; set; }

        /// <summary>
        /// Tournament password for authorization
        /// </summary>
        public string Password { get; set; }
    }
}