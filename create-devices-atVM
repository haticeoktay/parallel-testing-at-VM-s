const { Client } = require('ssh2');
const fs = require('fs/promises');

// Function to create an SSH session
async function createSshSession(host, user, password) {
    return new Promise((resolve, reject) => {
        const conn = new Client();

        conn.on('ready', () => {
            console.log(`SSH Connection to ${host} Successful`);
            resolve(conn);
        }).on('error', err => {
            console.error(`SSH Connection Error to ${host}: ${err}`);
            reject(err);
        }).on('end', () => {
            console.log(`SSH Connection to ${host} Closed`);
        }).connect({
            host: host,
            port: 22,
            username: user,
            password: password,
            tryKeyboard: true,
        });
    });
}

// Function to run Docker command on a VM
async function runDockerCommandOnVM(sshConnection, containerName) {
    const dockerCommand = `sudo docker run -d --name ${containerName} -e NAME=${containerName} -e TIMESTAMP=1 -t imagename`;

    return new Promise((resolve, reject) => {
        sshConnection.exec(dockerCommand, { pty: true }, (err, stream) => {
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

// Function to generate a report based on test results
function generateTestReport(testResults) {
    const reportContent = `
        Test Report
        ------------
        Total VMs: ${testResults.totalVMs}
        Containers per VM: ${testResults.containersPerVM}
        Containers Total: ${testResults.totalContainers}
        Success: ${testResults.successfulContainers}
        Failures: ${testResults.failedContainers}
        // Add more relevant details as needed
    `;

    return reportContent;
}

async function runOnMultipleVMs() {
    const vmConfigs = [
        { host: 'ip1', user: 'user', password: 'pass' },
        { host: 'ip2', user: 'user', password: 'pass' },
        
    ];

    const numberOfContainers = 2;

    try {
        const sshConnections = await Promise.all(vmConfigs.map(config =>
            createSshSession(config.host, config.user, config.password)
        ));

        for (let i = 1; i <= numberOfContainers; i++) {
            const containerName = `11ocak_01_${i}`;

            // Run Docker command on each VM in parallel
            await Promise.all(sshConnections.map(sshConnection =>
                runDockerCommandOnVM(sshConnection, containerName)
            ));

            // Add a delay between Docker commands (optional)
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        console.log('All Docker commands executed successfully');
    } catch (error) {
        console.error('Error during Docker commands execution:', error);
    } finally {
        // Close all SSH connections
        sshConnections.forEach(sshConnection => sshConnection.end());
		 // Generate and save the test report
        const testReport = generateTestReport(testResults);
        await fs.writeFile('test_report.txt', testReport);
        console.log('Test report generated successfully.');
    }
}



// Call the function to run Docker commands on multiple VMs
runOnMultipleVMs();
