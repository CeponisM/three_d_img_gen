const { exec } = require('child_process');
const path = require('path');

const convertModel = async () => {
    const modelPath = path.resolve(__dirname, 'src/model-small.pb'); // Path to your model file
    const outputDir = path.resolve(__dirname, 'tfjs_model'); // Output path

    try {
        const command = `npx tensorflowjs_converter --input_format=tf_frozen_model --output_node_names=outputs --output_format=tfjs_graph_model "${modelPath}" "${outputDir}"`;
        console.log('Running command:', command);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
    } catch (error) {
        console.error('Error converting model:', error);
    }
};

convertModel();
