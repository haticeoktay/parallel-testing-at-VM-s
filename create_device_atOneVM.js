const { Client } = require('ssh2');

// Function to create an SSH session
async function createSshSession() {
    const host = 'ip';
    const user = 'user';
    const password = 'Qwerty123456';

    return new Promise((resolve, reject) => {
        const conn = new Client();

        conn.on('ready', () => {
            console.log('SSH Connection Successful');
            resolve(conn);
        }).on('error', err => {
            console.error(`SSH Connection Error: ${err}`);
            reject(err);
        }).on('end', () => {
            console.log('SSH Connection Closed');
        }).connect({
            host: host,
            port: 22,
            username: user,
            password: password,
            tryKeyboard: true,
        });
    });
}

async function runDockerCommands() {
    const numberOfContainers = 1;
    const sshConnection = await createSshSession();

    // Array to store promises for Docker command execution
    const dockerCommandPromises = [];

    for (let i = 0; i <= numberOfContainers; i++) {
        const containerName = `10ocak_${i}`;
        const dockerCommand = `sudo docker run -d --name "${containerName}" -e NAME="${containerName}" -e TIMESTAMP=1 -t xxxxxx/ota-client:v0.7`;
        console.log(dockerCommand)
        console.log(dockerCommand.results)
        // Execute Docker command and store the promise
        dockerCommandPromises.push(execCommandOverSsh(sshConnection, dockerCommand));
        // Add a delay between Docker commands (optional)
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    try {
        // Wait for all Docker command promises to resolve
        const results = await Promise.all(dockerCommandPromises);
        console.log('All Docker commands executed successfully:', results);
    } catch (error) {
        console.error('Error during Docker commands execution:', error);
    } finally {
        // Close the SSH connection
        sshConnection.end();
    }
}

// Helper function to execute a command over SSH
function execCommandOverSsh(sshConnection, command) {
    return new Promise((resolve, reject) => {
        if (!sshConnection || typeof sshConnection.exec !== 'function') {
            reject(new Error('SSH connection is not properly initialized'));
            return;
        }
        sshConnection.exec(command, { pty: true }, (err, stream) => {
            if (err) {
                reject(err);
                return;
            }

            stream.on('close', (code, signal) => {
                console.log(`Command execution closed with code ${code} and signal ${signal}`);
                resolve();
            }).on('data', data => {
                console.log(`Command output: ${data}`);
            }).stderr.on('data', data => {
                console.error(`Error output: ${data}`);
                reject(data.toString());
            });
        });
    });
}

// Call the function to run Docker commands in parallel
runDockerCommands();
