const pool = require('../services/db');

module.exports.selectByUsername = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM User
    WHERE username = ?;
    `;
    const VALUES = [data.username];
            
    pool.query(SQLSTATMENT, VALUES, callback);             
}
      
module.exports.insertSingle = (data, callback) =>
{
    const SQLSTATMENT = `
    INSERT INTO User (username, email, password)
    VALUES (?, ?, ?);
    `;
    const VALUES = [data.username, data.email, data.password];
            
    pool.query(SQLSTATMENT, VALUES, callback);     
}

module.exports.readRefreshTokenById = (data, callback) => {
        const SQLSTATMENT = `
        SELECT refresh_token FROM User
        WHERE user_id = ?;
        `;
        const VALUES = [data.user_id];

        pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.storeRefreshToken = (data, callback) => {
        const SQLSTATMENT = `
        UPDATE User 
        SET refresh_token = ?
        WHERE user_id = ?;
        `;
        const VALUES = [data.refreshToken, data.userId]; 
                    
        pool.query(SQLSTATMENT, VALUES, callback);            
}

