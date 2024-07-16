const multer = require('multer');
const sftpClient = require('ssh2-sftp-client');
const path = require('path');

const upload = multer();

const sftpConfig = {
    host: 'node.croneex.com',
    port: '2022', // default 22
    username: 'dex12345.c5cdfb11',
    password: 'dex12345' // or use privateKey for key-based auth
};

module.exports = (req, res) => {
    if (req.method === 'POST') {
        upload.none()(req, res, async (err) => {
            if (err) {
                return res.status(500).send('Multer error: ' + err.message);
            }

            const { username, email, reason } = req.body;
            const data = `Username: ${username}\nEmail: ${email}\nReason: ${reason}\n\n`;
            const filePath = path.join('/tmp', 'whitelist.txt');

            const fs = require('fs');
            fs.appendFileSync(filePath, data);

            const client = new sftpClient();
            try {
                await client.connect(sftpConfig);
                await client.put(filePath, '/scriptfiles/Whitelist/whitelist.txt');
                res.send('Registration successful!');
            } catch (error) {
                console.error(error);
                res.status(500).send('Failed to register. Please try again later.');
            } finally {
                client.end();
            }
        });
    } else {
        res.status(405).send('Method Not Allowed');
    }
};
