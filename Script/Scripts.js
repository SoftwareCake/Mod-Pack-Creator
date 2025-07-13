let paramCount = 0;
let functionCount = 0;
let cardIdCounter = 0;
const requests = [];
let currentResponseData = null;
let selectedData = null;

// Function templates with descriptions
const functionTemplates = {
    'None': {
        description: 'Select a Type',
        value: '',
        placeholder: 'Select a Type'
    },
    'Say': {
        description: 'Output a message or value',
        value: '',
        placeholder: 'Hello World or {response.data.name}'
    },
    'Loop': {
        description: 'Iterate through array data',
        value: '[]',
        placeholder: 'response.data.items or {selected}'
    },
    'Calculate': {
        description: 'Perform mathematical operations',
        value: '()',
        placeholder: '{response.data.price} * 1.1 or sum({selected})'
    },
    'IfElse': {
        description: 'Conditional logic - format: condition ? true_value : false_value',
        value: '?',
        placeholder: '{response.data.status} === "active" ? "User is active" : "User is inactive"'
    },
	'Custom': {
		description: 'custom javascript code',
		value: '{}',
		placeholder: 'console.log("custom function executed")'
	}
};
	

// Initialize URL preview
document.getElementById('baseUrl').addEventListener('input', updateUrlPreview);

// Add parameter
document.getElementById('addParam').addEventListener('click', function() {
	paramCount++;
	
	const paramRow = document.createElement('div');
	paramRow.className = 'param-row';
	paramRow.innerHTML = '<div class="form-group">'+
                        '<label>Parameter Name</label>'+
                        '<input type="text" class="param-name" placeholder="API Parameter Name">'+
                    '</div>'+
                    '<div class="form-group">'+
                        '<label>Data Type</label>'+
                        '<select class="param-type">'+
                            '<option value="string">String</option>'+
                            '<option value="number">Number</option>'+
                            '<option value="boolean">Boolean</option>'+
                            '<option value="array">Array</option>'+
                            '<option value="object">Object</option>'+
                            '<option value="date">Date</option>'+
                            '<option value="email">Email</option>'+
                            '<option value="url">URL</option>'+
                        '</select>'+
                    '</div>'+
                    '<div class="form-group">'+
                        '<label>Key</label>'+
                        '<input type="text" class="param-key" placeholder="parameter">'+
                    '</div>'+
                    '<div class="form-group">'+
                        '<label>Value</label>'+
                        '<input type="text" class="param-value" placeholder="value">'+
                    '</div>'+
                    '<button type="button" class="btn btn-danger remove-param">Remove</button>';
	
	document.getElementById('emptyParams').classList.add('hidden');
	document.getElementById('paramsContainer').appendChild(paramRow);
	
	// Add event listeners
	paramRow.querySelector('.param-key').addEventListener('input', updateUrlPreview);
	paramRow.querySelector('.param-value').addEventListener('input', updateUrlPreview);
	paramRow.querySelector('.remove-param').addEventListener('click', function() {
		paramRow.remove();
		updateUrlPreview();
		
		if (document.querySelectorAll('.param-row').length === 0) {
			document.getElementById('emptyParams').classList.remove('hidden');
		}
	});
	
	updateUrlPreview();
});

// Handle function dropdown selection to add/remove text
function handleFunctionDropdownChange(selectElement) {
	const functionRow = selectElement.closest('.function-row');
	const valueTextarea = functionRow.querySelector('.function-value');
	const selectedValue = selectElement.value;
	
	// Get the template text for the selected function type
	const template = functionTemplates[selectedValue];
	if (template) {
		// Replace the textarea content with the template
		valueTextarea.value = template.value;
		
		// Update description
		const descriptionDiv = functionRow.querySelector('.function-description');
		descriptionDiv.textContent = template.description;
	}
}



// Add function
document.getElementById('addFunction').addEventListener('click', function() {
	functionCount++;
	
	const functionRow = document.createElement('div');
	functionRow.className = 'function-row';
	functionRow.innerHTML = '<div class="function-row-header">'+
			'<div class="form-group">'+
				'<label>Function Name</label>'+
				'<input type="text" class="function-name" placeholder="My Function ${functionCount}">'+
			'</div>'+
			'<div class="form-group">'+
				'<label>Function Type</label>'+
				'<select class="function-type">'+
					'<option value="None">Select...</option>'+
					'<option value="Say">Say</option>'+
					'<option value="Loop">Loop</option>'+
					'<option value="Calculate">Calculate</option>'+
					'<option value="IfElse">If/Else</option>'+
					'<option value="Custom">Custom</option>'+
				'</select>'+
			'</div>'+
			'<button type="button" class="btn btn-danger remove-function">Remove</button>'+
		'</div>'+
		'<div class="form-group">'+
			'<label>Function Code/Value</label>'+
			'<textarea class="function-value" placeholder="" rows="3"></textarea>'+
		'</div>'+
		'<div class="function-description">${functionTemplates["None"].description}</div>'
	;
	
	document.getElementById('emptyFunctions').classList.add('hidden');
	document.getElementById('functionsContainer').appendChild(functionRow);
	
	// Add event listeners
	const typeSelect = functionRow.querySelector('.function-type');
	const valueTextarea = functionRow.querySelector('.function-value');
	const descriptionDiv = functionRow.querySelector('.function-description');
	
	typeSelect.addEventListener('change', function() {
		<!-- const selectedType = this.value; -->
		<!-- const template = functionTemplates[selectedType]; -->
		<!-- valueTextarea.placeholder = template.placeholder; -->
		<!-- descriptionDiv.textContent = template.description; -->
		handleFunctionDropdownChange(this);
	});
	
	functionRow.querySelector('.remove-function').addEventListener('click', function() {
		functionRow.remove();
		
		if (document.querySelectorAll('.function-row').length === 0) {
			document.getElementById('emptyFunctions').classList.remove('hidden');
		}
	});
});

// Update URL preview
function updateUrlPreview() {
	const baseUrl = document.getElementById('baseUrl').value.trim() || 'https://api.example.com/endpoint';
	const params = [];
	
	document.querySelectorAll('.param-row').forEach(row => {
		const key = row.querySelector('.param-key').value.trim();
		const value = row.querySelector('.param-value').value.trim();
		
		if (key && value) {
			params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
		}
	});
	
	let finalUrl = baseUrl;
	if (params.length > 0) {
		finalUrl += '?' + params.join('&');
	}
	
	document.getElementById('urlPreview').textContent = finalUrl;
}

// Save request
document.getElementById('requestForm').addEventListener('submit', function(e) {
	e.preventDefault();
	
	const requestName = document.getElementById('requestName').value.trim() || 'Unnamed Request';
	const method = document.getElementById('method').value;
	const baseUrl = document.getElementById('baseUrl').value.trim();
	
	if (!baseUrl) {
		alert('Please enter a base URL');
		return;
	}
	
	// Collect parameters
	const parameters = [];
	document.querySelectorAll('.param-row').forEach(row => {
		const key = row.querySelector('.param-key').value.trim();
		const value = row.querySelector('.param-value').value.trim();
		
		if (key && value) {
			parameters.push({ 
				name: row.querySelector('.param-name').value.trim(), 
				type: row.querySelector('.param-type').value,
				key, 
				value 
			});
		}
	});
	
	// Collect functions
	const functions = [];
	document.querySelectorAll('.function-row').forEach(row => {
		const name = row.querySelector('.function-name').value.trim();
		const type = row.querySelector('.function-type').value;
		const value = row.querySelector('.function-value').value.trim();
		
		if (value) {
			functions.push({ 
				name: name || 'Unnamed Function', 
				type, 
				value 
			});
		}
	});
	
	const request = {
		id: Date.now(),
		name: requestName,
		method,
		baseUrl,
		parameters,
		functions,
		url: document.getElementById('urlPreview').textContent
	};
	
	requests.push(request);
	displaySavedRequests();
	
	// Reset form
	document.getElementById('requestForm').reset();
	document.getElementById('urlPreview').textContent = 'https://api.example.com/endpoint';
	
	// Clear parameters and functions
	document.querySelectorAll('.param-row').forEach(row => row.remove());
	document.querySelectorAll('.function-row').forEach(row => row.remove());
	document.getElementById('emptyParams').classList.remove('hidden');
	document.getElementById('emptyFunctions').classList.remove('hidden');
	
	alert('Request saved successfully!');
});

// Display saved requests
function displaySavedRequests() {
	const container = document.getElementById('savedRequests');
	
	if (requests.length === 0) {
		container.innerHTML = '<div class="empty-state">No saved requests yet</div>';
		return;
	}
	
	container.innerHTML = '';
	
	requests.forEach(request => {
		const requestDiv = document.createElement('div');
		requestDiv.className = 'saved-request';
		
		let functionsHtml = '';
		if (request.functions && request.functions.length > 0) {
			functionsHtml = 
				'<div class="request-functions">'+
					'<strong>Functions (' + request.functions.length + '):</strong>'+
					request.functions.map(func => '<div class="function-item"><div class="function-name">' + func.name + '</div><div>' + func.type + ': ' + func.value + '</div></div>').join('') +
				'</div>';
		}
		
		let parametersHtml = '';
		if (request.parameters && request.parameters.length > 0) {
			parametersHtml = 
				'<div class="request-functions">'+
					'<strong>Parameters (' + request.parameters.length + '):</strong>'+
					request.parameters.map(param => '<div class="function-item"><div class="function-name">' + (param.name || param.key) + '</div><div>' + param.key + ': ' + param.value + '</div></div>').join('') +
				'</div>';
		}
		
		let baseUrlHtml = 
			'<div class="request-functions">'+
				'<strong>Base URL:</strong>'+
				'<div class="function-item"><div>' + request.baseUrl + '</div></div>'+
			'</div>';
		
		requestDiv.innerHTML = '<div class="request-header">'+
									'<div>'+
										'<span class="method-badge method-' + request.method.toLowerCase() + '">' + request.method + '</span>'+
										'<strong>' + request.name + '</strong>'+
									'</div>'+
									'<div class="btn-group">'+
										'<button class="btn btn-secondary" onclick="loadRequest(' + request.id + ')">Load</button>'+
										'<button class="btn btn-secondary" onclick="testSavedRequest(' + request.id + ')">Test</button>'+
										'<button class="btn btn-success" onclick="executeSavedFunctions(' + request.id + ')">Execute</button>'+
										'<button class="btn btn-danger" onclick="deleteRequest(' + request.id + ')">Delete</button>'+
									'</div>'+
								'</div>'+
								'<div class="request-url">' + request.url + '</div>'+
								baseUrlHtml +
								parametersHtml +
								functionsHtml;
		
		container.appendChild(requestDiv);
	});
}

async function testApiRequest(method, url) {
	const responseCard = document.getElementById('responseCard');
	const responseStatus = document.getElementById('responseStatus');
	const responseBody = document.getElementById('responseBody');
	const executionLog = document.getElementById('executionLog');
	
	// Show response card
	responseCard.style.display = 'block';
	responseStatus.textContent = 'Loading...';
	responseBody.textContent = 'Making API request...';
	executionLog.style.display = 'none';
	
	// Add toggle button if it doesn't exist
	addToggleViewButton();
	
	try {
		// Add CORS proxy for external APIs
		if (url.includes('weatherstack.com') || url.includes('openweathermap.org') || (!url.includes('localhost') && !url.includes('127.0.0.1'))) {
			url = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
		}
		
		const response = await fetch(url, {
			method: method,
			headers: {
				'Content-Type': 'application/json',
			}
		});
		
		let data;
		const contentType = response.headers.get('content-type');
		
		if (contentType && contentType.includes('application/json')) {
			data = await response.json();
		} else {
			const text = await response.text();
			try {
				data = JSON.parse(text);
			} catch {
				data = { response: text };
			}
		}
		
		currentResponseData = data;
		
		responseStatus.textContent = `Response (${response.status} ${response.statusText})`;
		responseBody.textContent = JSON.stringify(data, null, 2);
		
		// Show selection controls if data has selectable items
		setupDataSelection(data);
		
		// Show toggle button if we have selectable data
		const toggleBtn = document.getElementById('toggleView');
		if (toggleBtn) {
			const hasSelectableData = Array.isArray(data) || 
				(typeof data === 'object' && data !== null && 
				 Object.values(data).some(val => Array.isArray(val)));
			toggleBtn.style.display = hasSelectableData ? 'inline-block' : 'none';
		}
		
	} catch (error) {
		responseStatus.textContent = 'Error';
		responseBody.textContent = `Error: ${error.message}`;
		currentResponseData = null;
		
		// Hide selection controls on error
		document.getElementById('selectAll').style.display = 'none';
		document.getElementById('getSelected').style.display = 'none';
		document.getElementById('checkboxList').style.display = 'none';
		document.getElementById('responseBody').style.display = 'block';
		const toggleBtn = document.getElementById('toggleView');
		if (toggleBtn) toggleBtn.style.display = 'none';
	}
}

function flattenDataForCheckboxes(data, path = '', items = [], globalIndex = { value: 0 }) {
	if (Array.isArray(data)) {
		data.forEach((item, index) => {
			const currentPath = path ? `${path}[${index}]` : `[${index}]`;
			if (typeof item === 'object' && item !== null) {
				// Add the object itself as selectable
				items.push({
					item: item,
					path: currentPath,
					type: 'object',
					globalIndex: globalIndex.value++
				});
				// Recursively add nested properties
				flattenDataForCheckboxes(item, currentPath, items, globalIndex);
			} else {
				// Add primitive values
				items.push({
					item: item,
					path: currentPath,
					type: 'primitive',
					globalIndex: globalIndex.value++
				});
			}
		});
	} else if (typeof data === 'object' && data !== null) {
		Object.keys(data).forEach(key => {
			const currentPath = path ? `${path}.${key}` : key;
			const value = data[key];
			
			if (Array.isArray(value)) {
				// Add array as selectable
				items.push({
					item: value,
					path: currentPath,
					type: 'array',
					globalIndex: globalIndex.value++
				});
				// Recursively process array items
				flattenDataForCheckboxes(value, currentPath, items, globalIndex);
			} else if (typeof value === 'object' && value !== null) {
				// Add nested object as selectable
				items.push({
					item: value,
					path: currentPath,
					type: 'object',
					globalIndex: globalIndex.value++
				});
				// Recursively process nested object
				flattenDataForCheckboxes(value, currentPath, items, globalIndex);
			} else {
				// Add primitive property
				items.push({
					item: value,
					path: currentPath,
					type: 'primitive',
					globalIndex: globalIndex.value++
				});
			}
		});
	}
	
	return items;
}

// Setup data selection for functions
function setupDataSelection(data) {
	const selectAllBtn = document.getElementById('selectAll');
	const getSelectedBtn = document.getElementById('getSelected');
	const checkboxList = document.getElementById('checkboxList');
	const responseBody = document.getElementById('responseBody');
	
	// Flatten all nested properties
	const itemsToShow = flattenDataForCheckboxes(data);
	
	if (itemsToShow.length > 0) {
		selectAllBtn.style.display = 'inline-block';
		getSelectedBtn.style.display = 'inline-block';
		checkboxList.style.display = 'block';
		responseBody.style.display = 'none';
		checkboxList.innerHTML = '';
		
		// Group items by depth for better organization
		const groupedItems = {};
		itemsToShow.forEach(itemData => {
			const depth = (itemData.path.match(/\./g) || []).length + (itemData.path.match(/\[/g) || []).length;
			if (!groupedItems[depth]) groupedItems[depth] = [];
			groupedItems[depth].push(itemData);
		});
		
		// Create checkboxes organized by depth
		Object.keys(groupedItems).sort((a, b) => parseInt(a) - parseInt(b)).forEach(depth => {
			if (depth > 0) {
				const depthHeader = document.createElement('div');
				depthHeader.style.cssText = 'font-weight: bold; margin: 16px 0 8px 0; padding: 8px; background: #e9ecef; border-radius: 4px; font-size: 12px;';
				depthHeader.textContent = `Nested Level ${depth} (${groupedItems[depth].length} items)`;
				checkboxList.appendChild(depthHeader);
			}
			
			groupedItems[depth].forEach(itemData => {
				const checkboxItem = document.createElement('div');
				checkboxItem.className = 'checkbox-item';
				checkboxItem.style.marginLeft = `${parseInt(depth) * 12}px`;
				
				const typeIndicator = {
					'array': '📋',
					'object': '📦',
					'primitive': '🔤'
				}[itemData.type] || '•';
				
				checkboxItem.innerHTML = `
					<input type="checkbox" id="item-${itemData.globalIndex}" value="${itemData.globalIndex}">
					<div class="checkbox-content">
						<div style="font-size: 11px; color: #6c757d; margin-bottom: 4px;">
							${typeIndicator} ${itemData.path} (${itemData.type})
						</div>
						<div style="max-height: 100px; overflow-y: auto; font-size: 12px;">
							${JSON.stringify(itemData.item, null, 2)}
						</div>
					</div>
				`;
				checkboxList.appendChild(checkboxItem);
			});
		});
		
		window.checkboxItemsData = itemsToShow;
	} else {
		selectAllBtn.style.display = 'none';
		getSelectedBtn.style.display = 'none';
		checkboxList.style.display = 'none';
		responseBody.style.display = 'block';
	}
}

// Execute functions
function executeFunctions(functions, data) {
	const executionLog = document.getElementById('executionLog');
	executionLog.style.display = 'block';
	executionLog.innerHTML = '<div class="log-entry log-info">Starting function execution...</div>';
	
	functions.forEach((func, index) => {
		try {
			let result;
			const logEntry = document.createElement('div');
			logEntry.className = 'log-entry';
			
			switch (func.type) {
				case 'Say':
					result = evaluateExpression(func.value, data, selectedData);
					logEntry.className += ' log-success';
					logEntry.textContent = `${result}`;
					break;
					
				case 'Loop':
					const arrayToLoop = evaluateExpression(func.value, data, selectedData);
					if (Array.isArray(arrayToLoop)) {
						result = `Looped through ${arrayToLoop.length} items`;
						arrayToLoop.forEach((item, i) => {
							const itemLog = document.createElement('div');
							itemLog.className = 'log-entry log-info';
							itemLog.textContent = `  Item ${i}: ${JSON.stringify(item)}`;
							executionLog.appendChild(itemLog);
						});
					} else {
						result = 'Not an array';
					}
					logEntry.className += ' log-success';
					logEntry.textContent = `${func.name}: ${result}`;
					break;
					
				case 'Calculate':
					result = evaluateExpression(func.value, data, selectedData);
					logEntry.className += ' log-success';
					logEntry.textContent = `${func.name}: ${result}`;
					break;
											
				case 'Custom':
					// Execute custom JavaScript code
					const customFunc = new Function('response', 'selected', 'data', func.value);
					result = customFunc(data, selectedData, data);
					logEntry.className += ' log-success';
					logEntry.textContent = `${func.name}: Custom function executed`;
					break;
				case 'IfElse':
					// Parse condition ? true_value : false_value
					const parts = func.value.split('?');
					if (parts.length === 2) {
						const condition = parts[0].trim();
						const values = parts[1].split(':');
						if (values.length === 2) {
							const conditionResult = evaluateExpression(condition, data, selectedData);
							const trueValue = values[0].trim();
							const falseValue = values[1].trim();
							result = conditionResult ? evaluateExpression(trueValue, data, selectedData) : evaluateExpression(falseValue, data, selectedData);
						} else {
							result = 'Invalid if/else format';
						}
					} else {
						result = 'Invalid if/else format';
					}
					logEntry.className += ' log-success';
					logEntry.textContent = `${func.name}: ${result}`;
					break;
					
				default:
					result = 'Unknown function type';
					logEntry.className += ' log-error';
					logEntry.textContent = `${func.name}: ${result}`;
			}
			
			executionLog.appendChild(logEntry);
			
		} catch (error) {
			const errorLog = document.createElement('div');
			errorLog.className = 'log-entry log-error';
			errorLog.textContent = `${func.name}: Error - ${error.message}`;
			executionLog.appendChild(errorLog);
		}
	});
	
	const completionLog = document.createElement('div');
	completionLog.className = 'log-entry log-info';
	completionLog.textContent = 'Function execution completed.';
	executionLog.appendChild(completionLog);
}

function evaluateExpression(expression, responseData, selectedData) {
	try {
		// Handle simple cases first
		if (expression === '{response}') return JSON.stringify(responseData, null, 2);
		if (expression === '{selected}') return selectedData;
		
		// Handle arrays of expressions for Loop function
		if (expression.startsWith('[') && expression.endsWith(']')) {
			try {
				const parsed = JSON.parse(expression);
				return parsed.map(item => evaluateExpression(item, responseData, selectedData));
			} catch (e) {
				// If JSON parsing fails, continue with normal processing
			}
		}
		
		// Replace placeholders with actual values in curly braces
		let processedExpression = expression.replace(/\{([^}]+)\}/g, (match, path) => {
			const func = new Function('responseData', 'selectedData', `return ${path.replace(/:/g, '.')}`);
			return func(responseData, selectedData);
		});
		
		// Handle mathematical operations
		if (/[\+\-\*\/\(\)]/.test(processedExpression) && !processedExpression.includes('{')) {
			return eval(processedExpression);
		}
		
		return processedExpression;
	} catch (error) {
		return `Error: ${error.message}`;
	}
}

// Add event listeners for Test API and Execute Functions buttons
document.getElementById('testApi').addEventListener('click', function() {
	const method = document.getElementById('method').value;
	const url = document.getElementById('urlPreview').textContent;
	testApiRequest(method, url);
});

document.getElementById('executeFunctions').addEventListener('click', function() {
	if (!currentResponseData) {
		alert('Please test the API first to get response data');
		return;
	}
	
	// Collect current functions
	const functions = [];
	document.querySelectorAll('.function-row').forEach(row => {
		const name = row.querySelector('.function-name').value.trim();
		const type = row.querySelector('.function-type').value;
		const value = row.querySelector('.function-value').value.trim();
		
		if (value) {
			functions.push({ 
				name: name || 'Unnamed Function', 
				type, 
				value 
			});
		}
	});
	
	if (functions.length === 0) {
		alert('Please add at least one function to execute');
		return;
	}
	
	executeFunctions(functions, currentResponseData);
});

document.getElementById('getSelected').addEventListener('click', function() {
	const checkedBoxes = document.querySelectorAll('#checkboxList input[type="checkbox"]:checked');
	
	if (checkedBoxes.length === 0) {
		alert('Please select at least one item');
		return;
	}
	
	selectedData = [];
	checkedBoxes.forEach(cb => {
		const globalIndex = parseInt(cb.value);
		const itemData = window.checkboxItemsData?.[globalIndex];
		if (itemData) {
			selectedData.push(itemData.item);
		}
	});
				
	alert(`Selected ${selectedData.length} items. Added to function dropdowns.`);
	updatePersistentSelectedButtons();
});

// Add selected items as buttons under function description
function addSelectedItemButtons() {
	if (!selectedData || selectedData.length === 0) return;
	
	const checkedBoxes = document.querySelectorAll('#checkboxList input[type="checkbox"]:checked');
	const selectedPaths = [];
	
	checkedBoxes.forEach(cb => {
		const globalIndex = parseInt(cb.value);
		const itemData = window.checkboxItemsData?.[globalIndex];
		if (itemData) {
			// Parse the path to get parent and property
			const pathParts = itemData.path.split('.');
			const parentProperty = pathParts.length > 1 ? pathParts[pathParts.length - 2] : pathParts[0];
			const selectedProperty = pathParts[pathParts.length - 1];
			
			selectedPaths.push({ 
				path: itemData.path, 
				data: itemData.item,
				parentProperty: parentProperty,
				selectedProperty: selectedProperty
			});
		}
	});
	
	// Add buttons to all existing function rows
	document.querySelectorAll('.function-row').forEach(functionRow => {
		const descriptionDiv = functionRow.querySelector('.function-description');
		
		// Remove existing selected buttons
		const existingButtons = functionRow.querySelectorAll('.selected-btn');
		existingButtons.forEach(btn => btn.remove());
		
		// Add new buttons
		selectedPaths.forEach(item => {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'btn btn-secondary selected-btn';
			button.style.cssText = 'margin: 4px; padding: 4px 8px; font-size: 11px;';
			button.textContent = `{${item.parentProperty}:${item.selectedProperty}}`;
			button.onclick = function() {
				const text = `{${item.parentProperty}:${item.selectedProperty}}`;
				navigator.clipboard.writeText(text).then(() => {
					alert('Copied to clipboard!');
					<!-- const valueTextarea = functionRow.querySelector('.function-value'); -->
					<!-- valueTextarea.value += text; -->
				}).catch(() => {
					alert('Copied to clipboard!');						
					<!-- // Fallback: just add to textarea if clipboard fails -->
					<!-- const valueTextarea = functionRow.querySelector('.function-value'); -->
					<!-- valueTextarea.value += text; -->
				});
			};
			descriptionDiv.appendChild(button);
		});
	});
}

// Enhanced selectAll functionality
document.getElementById('selectAll').addEventListener('click', function() {
	const checkboxes = document.querySelectorAll('#checkboxList input[type="checkbox"]');
	const allChecked = Array.from(checkboxes).every(cb => cb.checked);
	
	checkboxes.forEach(cb => {
		cb.checked = !allChecked;
	});
	
	this.textContent = allChecked ? 'Select All' : 'Deselect All';
});

function addToggleViewButton() {
	const responseCard = document.getElementById('responseCard');
	const btnGroup = responseCard.querySelector('.btn-group');
	
	if (!document.getElementById('toggleView')) {
		const toggleBtn = document.createElement('button');
		toggleBtn.id = 'toggleView';
		toggleBtn.className = 'btn btn-secondary';
		toggleBtn.textContent = 'Show JSON';
		toggleBtn.style.display = 'none';
		
		toggleBtn.addEventListener('click', function() {
			const checkboxList = document.getElementById('checkboxList');
			const responseBody = document.getElementById('responseBody');
			
			if (checkboxList.style.display === 'none') {
				checkboxList.style.display = 'block';
				responseBody.style.display = 'none';
				this.textContent = 'Show JSON';
				document.getElementById('selectAll').style.display = 'inline-block';
				document.getElementById('getSelected').style.display = 'inline-block';
			} else {
				checkboxList.style.display = 'none';
				responseBody.style.display = 'block';
				this.textContent = 'Show Selection';
				document.getElementById('selectAll').style.display = 'none';
				document.getElementById('getSelected').style.display = 'none';
			}
		});
		
		btnGroup.insertBefore(toggleBtn, document.getElementById('closeResponse'));
	}
}

// Auto-populate function dropdown with selected data
function populateFunctionDropdown() {
	if (!selectedData || selectedData.length === 0) return;
	
	// Add a new function row automatically
	document.getElementById('addFunction').click();
	const lastFunctionRow = document.querySelector('.function-row:last-child');
	
	// Set function name and type
	lastFunctionRow.querySelector('.function-name').value = `Process Selected (${selectedData.length} items)`;
	lastFunctionRow.querySelector('.function-type').value = 'Say';
	lastFunctionRow.querySelector('.function-value').value = '{selected}';
	
	// Trigger change event to update description
	lastFunctionRow.querySelector('.function-type').dispatchEvent(new Event('change'));
}

// Add selected items to function type dropdown
function addSelectedToFunctionDropdown() {
	if (!selectedData || selectedData.length === 0) return;
	
	const checkedBoxes = document.querySelectorAll('#checkboxList input[type="checkbox"]:checked');
	const selectedPaths = [];
	
	checkedBoxes.forEach(cb => {
		const globalIndex = parseInt(cb.value);
		const itemData = window.checkboxItemsData?.[globalIndex];
		if (itemData) {
			selectedPaths.push(itemData.path);
		}
	});
	
	// Add to all existing function type dropdowns
	document.querySelectorAll('.function-type').forEach(select => {
		// Remove existing selected options first
		Array.from(select.options).forEach(option => {
			if (option.value.startsWith('selected_')) {
				option.remove();
			}
		});
		
		// Add new selected options
		selectedPaths.forEach(path => {
			const option = document.createElement('option');
			option.value = `selected_${path}`;
			option.textContent = `Selected: ${path}`;
			select.appendChild(option);
		});
	});
}

document.getElementById('closeResponse').addEventListener('click', function() {
	document.getElementById('responseCard').style.display = 'none';
});

// Utility functions for saved requests
function loadRequest(requestId) {
	const request = requests.find(r => r.id === requestId);
	if (!request) return;
	
	// Load basic info
	document.getElementById('requestName').value = request.name;
	document.getElementById('method').value = request.method;
	document.getElementById('baseUrl').value = request.baseUrl;
	
	// Clear existing parameters and functions
	document.querySelectorAll('.param-row').forEach(row => row.remove());
	document.querySelectorAll('.function-row').forEach(row => row.remove());
	document.getElementById('emptyParams').classList.remove('hidden');
	document.getElementById('emptyFunctions').classList.remove('hidden');
	
	// Load parameters
	request.parameters.forEach(param => {
		document.getElementById('addParam').click();
		const lastParamRow = document.querySelector('.param-row:last-child');
		lastParamRow.querySelector('.param-name').value = param.name || '';
		lastParamRow.querySelector('.param-type').value = param.type || 'string';
		lastParamRow.querySelector('.param-key').value = param.key;
		lastParamRow.querySelector('.param-value').value = param.value;
	});
	
	// Load functions
	request.functions.forEach(func => {
		document.getElementById('addFunction').click();
		const lastFunctionRow = document.querySelector('.function-row:last-child');
		lastFunctionRow.querySelector('.function-name').value = func.name;
		lastFunctionRow.querySelector('.function-type').value = func.type;
		lastFunctionRow.querySelector('.function-value').value = func.value;
		
		// Trigger change event to update description
		lastFunctionRow.querySelector('.function-type').dispatchEvent(new Event('change'));
	});
	
	updateUrlPreview();
	alert('Request loaded successfully!');
}

function testSavedRequest(requestId) {
	const request = requests.find(r => r.id === requestId);
	if (!request) return;
	
	testApiRequest(request.method, request.url);
}

function executeSavedFunctions(requestId) {
	const request = requests.find(r => r.id === requestId);
	if (!request) return;
	
	// Create text content for the file
	const textContent = `Request: ${request.name}\n` +
		`Method: ${request.method}\n` +
		`URL: ${request.url}\n` +
		`Base URL: ${request.baseUrl}\n` +
		`Parameters: ${JSON.stringify(request.parameters, null, 2)}\n` +
		`Functions: ${JSON.stringify(request.functions, null, 2)}\n` +
		`Response Data: ${currentResponseData ? JSON.stringify(currentResponseData, null, 2) : 'No response data available'}\n` +
		`Generated on: ${new Date().toISOString()}`;
	
	// Create and download the file
	const blob = new Blob([textContent], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `${request.name.replace(/[^a-z0-9]/gi, '_')}.txt`;
	a.click();
	URL.revokeObjectURL(url);
}

function deleteRequest(requestId) {
	if (confirm('Are you sure you want to delete this request?')) {
		const index = requests.findIndex(r => r.id === requestId);
		if (index > -1) {
			requests.splice(index, 1);
			displaySavedRequests();
		}
	}
}

// Create persistent selected items section
function createPersistentSelectedSection() {
	const functionsContainer = document.getElementById('functionsContainer');
	
	// Check if persistent section already exists
	if (document.getElementById('persistentSelectedSection')) return;
	
	const persistentSection = document.createElement('div');
	persistentSection.id = 'persistentSelectedSection';
	persistentSection.style.cssText = 'background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 12px; margin-bottom: 16px;';
	persistentSection.innerHTML = `
		<div style="font-weight: bold; margin-bottom: 8px; color: #856404;">Selected API Response Items:</div>
		<div id="persistentSelectedButtons" style="display: flex; flex-wrap: wrap; gap: 6px;"></div>
	`;
	
	// Insert before the functions container
	functionsContainer.parentNode.insertBefore(persistentSection, functionsContainer);
}

// Update selected items in persistent section
function updatePersistentSelectedButtons() {
	if (!selectedData || selectedData.length === 0) return;
	
	createPersistentSelectedSection();
	
	const checkedBoxes = document.querySelectorAll('#checkboxList input[type="checkbox"]:checked');
	const persistentButtonsContainer = document.getElementById('persistentSelectedButtons');
	
	// Clear existing buttons
	persistentButtonsContainer.innerHTML = '';
	
	checkedBoxes.forEach(cb => {
		const globalIndex = parseInt(cb.value);
		const itemData = window.checkboxItemsData?.[globalIndex];
		if (itemData) {		
			const pathParts = itemData.path.split('.');
			const parentProperty = pathParts.length > 1 ? pathParts[pathParts.length - 2] : pathParts[0];
			const selectedProperty = pathParts[pathParts.length - 1];
			
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'btn btn-secondary';
			button.style.cssText = 'padding: 4px 8px; font-size: 11px; margin: 2px;';
			button.textContent = `{${parentProperty}:${selectedProperty}}`;
			button.onclick = function() {
				const text = `{${parentProperty}:${selectedProperty}}`;
				navigator.clipboard.writeText(text).then(() => {
					// Add to currently focused textarea or the last function textarea
					const activeTextarea = document.activeElement.tagName === 'TEXTAREA' ? 
						document.activeElement : 
						document.querySelector('.function-value:last-of-type');
					
					if (activeTextarea && activeTextarea.classList.contains('function-value')) {
						<!-- activeTextarea.value += text; -->
						alert('Copied to clipboard!');
					} else {
						alert('Copied to clipboard!');
					}
				}).catch(() => {
					// Fallback: just add to textarea if clipboard fails
					const activeTextarea = document.activeElement.tagName === 'TEXTAREA' ? 
						document.activeElement : 
						document.querySelector('.function-value:last-of-type');
					
					if (activeTextarea && activeTextarea.classList.contains('function-value')) {
						<!-- activeTextarea.value += text; -->
					} else {
						alert('Please click in a function value field first');
					}
				});
			};
			persistentButtonsContainer.appendChild(button);
		}
	});
}

// Clear all requests
document.getElementById('clearAll').addEventListener('click', function() {
	if (confirm('Are you sure you want to delete all saved requests?')) {
		requests.length = 0;
		displaySavedRequests();
	}
});