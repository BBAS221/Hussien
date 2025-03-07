function openGeneratorWindow(type) {
    const generatorWindow = window.open('', 'Tag Generator', 'width=600,height=800');
    generatorWindow.document.write(`
        <html>
        <head>
            <title>Tag Generator</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #121212;
                    color: white;
                    padding: 2rem;
                }
                .input-group {
                    margin-bottom: 1rem;
                }
                input, button {
                    padding: 0.5rem 1rem;
                    margin: 0.5rem 0;
                    border-radius: 5px;
                    background: #2a2a2a;
                    color: white;
                    border: 1px solid #404040;
                }
                button {
                    cursor: pointer;
                    background: #4a9eff;
                }
                button:hover {
                    background: #3a7fd5;
                }
                #results {
                    margin-top: 2rem;
                    padding: 1rem;
                    background: #1a1a1a;
                    border-radius: 10px;
                }
                .available {
                    color: #4CAF50;
                    margin: 0.5rem 0;
                }
                .taken {
                    color: #f44336;
                    margin: 0.5rem 0;
                }
            </style>
        </head>
        <body>
            <h2>Xbox Gamertag Generator</h2>
            <div class="input-group">
                <label>Length (3-15):</label>
                <input type="number" id="length" min="3" max="15" value="5">
            </div>
            <div class="input-group">
                <label>Amount to generate:</label>
                <input type="number" id="amount" min="1" max="50" value="5">
            </div>
            <button onclick="generateTags()">Generate Tags</button>
            <div id="results"></div>

            <script>
                async function generateTags() {
                    const length = parseInt(document.getElementById('length').value);
                    const amount = parseInt(document.getElementById('amount').value);
                    const results = document.getElementById('results');
                    
                    if (isNaN(length) || isNaN(amount)) {
                        results.innerHTML = '<p style="color: #f44336;">Please enter valid numbers</p>';
                        return;
                    }
                    
                    results.innerHTML = '<h3>Results:</h3><div id="available"><h4>Available Tags:</h4></div><div id="taken"><h4>Taken Tags:</h4></div><div id="progress"></div>';
                    const availableDiv = results.querySelector('#available');
                    const takenDiv = results.querySelector('#taken');
                    const progressDiv = results.querySelector('#progress');
                    
                    try {
                        const response = await fetch('http://127.0.0.1:5000/api/xbox/generate', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({ length, amount })
                        });
                        
                        if (!response.ok) {
                            throw new Error(\`Server error: \${response.status}\`);
                        }
                        
                        const reader = response.body.getReader();
                        const decoder = new TextDecoder();
                        
                        while (true) {
                            const { value, done } = await reader.read();
                            if (done) break;
                            
                            const data = JSON.parse(decoder.decode(value));
                            progressDiv.innerHTML = \`Checking tag \${data.current} of \${amount}...\`;
                            
                            if (data.isAvailable) {
                                const div = document.createElement('div');
                                div.className = 'available';
                                div.innerHTML = \`✓ \${data.tag}\`;
                                availableDiv.appendChild(div);
                            } else {
                                const div = document.createElement('div');
                                div.className = 'taken';
                                div.innerHTML = \`× \${data.tag}\`;
                                takenDiv.appendChild(div);
                            }
                            
                            // Scroll to bottom to show new results
                            results.scrollTop = results.scrollHeight;
                        }
                        
                        progressDiv.innerHTML = 'Generation complete!';
                    } catch (error) {
                        results.innerHTML = \`<p style="color: #f44336;">Error: \${error.message}</p>\`;
                        console.error('API Error:', error);
                    }
                }
            </script>
        </body>
        </html>
    `);
}