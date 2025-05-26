import 'cypress-xpath';

describe('template spec', () => {

    before(() => {
      // Clean the database before running tests
      cy.task('cleanDb');
    });
  
    beforeEach(() => {
      // Handle uncaught exceptions from your React app
      cy.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from failing the test
        if (err.message.includes('Cannot read properties of undefined')) {
          return false;
        }
        return true;
      });
    });
  
    // Function to perform registration
    const registerUser = (username, email, password, expectedMessage) => {
      // Fill out the registration form
      const usernameXPath = '//*[@id="root"]/div/div/section/div/div/div[2]/form/div[2]/input';
      const emailXPath = '//*[@id="root"]/div/div/section/div/div/div[2]/form/div[3]/input';
      const passwordXPath = '//*[@id="root"]/div/div/section/div/div/div[2]/form/div[4]/input';
  
      // Function to type value if not empty
      const typeIfNotEmpty = (xpath, value) => {
        if (value) {
          cy.xpath(xpath)
            .should('be.visible')
            .clear() // Clear field first
            .type(value);
        } else {
          cy.log(`Skipping typing for empty value at XPath: ${xpath}`);
        }
      };
  
      // Type values for username, email, and password
      typeIfNotEmpty(usernameXPath, username);
      typeIfNotEmpty(emailXPath, email);
      typeIfNotEmpty(passwordXPath, password);
  
      // Click the submit button
      const submitButtonXPath = '//*[@id="root"]/div/div/section/div/div/div[2]/form/button';
      cy.xpath(submitButtonXPath)
        .should('be.visible')
        .click();

      // Wait for potential redirection or error message
      cy.wait(1000);

      // Check if we expect an error message
      if (expectedMessage && expectedMessage.trim() !== '') {
        // We expect an error, so look for the error message
        const messageAreaXPath = '//*[@id="root"]/div/div/section/div/div/div[2]/form/div[1]/div';
        
        cy.xpath(messageAreaXPath, { timeout: 10000 })
          .should('be.visible')
          .then(($div) => {
            if ($div.hasClass('bg-red-200')) {
              const errorMessage = $div.text().trim();
              expect(errorMessage).to.contain(expectedMessage);
              cy.log('Registration Failed with Error Message: ' + errorMessage);
            } else {
              throw new Error('Expected error message but found success state');
            }
          });
      } else {
        // We expect success, so check for redirection away from registration page
        cy.url({ timeout: 10000 }).should('not.include', '/registration');
        cy.log('Registration Successful and user redirected.');
        
        // Optional: Verify we're on the expected success page
        cy.url().should('eq', 'http://localhost:3000/');
      }
    };

  it('simulates failed registration due to weak password', () => {
    // Visit the page before performing actions
    cy.visit('http://localhost:3000/');
    
    // Click on the specified link/button using XPath
    cy.xpath('//*[@id="root"]/div/div/section/div/div/div[2]/form/div[5]/p/a')
      .should('be.visible')
      .click();

    // Call the register function with a weak password to trigger the error
    registerUser('weak_username', 'weak_email@example.com', 'weak', 'Please enter a strong password');
  });

  it('simulates failed registration due to empty fields', () => {
    // Visit the page before performing actions
    cy.visit('http://localhost:3000/');
    
    // Click on the specified link/button using XPath
    cy.xpath('//*[@id="root"]/div/div/section/div/div/div[2]/form/div[5]/p/a')
      .should('be.visible')
      .click();

    // Call the register function with empty fields to trigger the error
    registerUser('', '', '', 'Expected a string but received a undefined');
  }); 
  
  it('simulates successful registration', () => {
    // Visit the page before performing actions
    cy.visit('http://localhost:3000/');
    
    // Click on the specified link/button using XPath
    cy.xpath('//*[@id="root"]/div/div/section/div/div/div[2]/form/div[5]/p/a')
      .should('be.visible')
      .click();

    // Call the register function with valid details - pass null or empty string for expectedMessage
    registerUser('valid_username', 'valid_email@example.com', 'StrongPassword2025@@', null);
  });

  it('simulates duplicate registration', () => {
    // Visit the page before performing actions
    cy.visit('http://localhost:3000/');
    
    // Click on the specified link/button using XPath
    cy.xpath('//*[@id="root"]/div/div/section/div/div/div[2]/form/div[5]/p/a')
      .should('be.visible')
      .click();

    // Call the register function with valid details
    registerUser('valid_username', 'valid_email@example.com', 'StrongPassword2025@@', 'User already exists');
  });

  it('logs in successfully, checks for Logout button, and clicks Logout', () => {
      // Function to perform login
      const loginUser = (username, password) => {
        // Assume these are the XPaths for the login fields and button
        const usernameXPath = '//*[@id="root"]/div/div/section/div/div/div[2]/form/div[2]/input';
        const passwordXPath = '//*[@id="root"]/div/div/section/div/div/div[2]/form/div[3]/input';
        const loginButtonXPath = '//*[@id="root"]/div/div/section/div/div/div[2]/form/div[5]/button';
        
        // Type credentials into the login form
        cy.xpath(usernameXPath)
          .should('be.visible')
          .type(username);
        
        cy.xpath(passwordXPath)
          .should('be.visible')
          .type(password);
        
        // Click the login button
        cy.xpath(loginButtonXPath)
          .should('be.visible')
          .click();
      };
  
      // Visit the login page
      cy.visit('http://localhost:3000/login');
  
      // Perform login
      loginUser('valid_email@example.com', 'StrongPassword2025@@');
  
      // Verify redirection to the homepage
      cy.url().should('eq', 'http://localhost:3000/');
  
      // Verify the Logout button is visible
      const logoutButtonXPath = '//*[@id="root"]/div/nav/div[2]/div/button';
      cy.xpath(logoutButtonXPath)
        .should('be.visible')
        .and(($button) => {
          expect($button.text().trim()).to.equal('Logout');
        });
  
      cy.log('Successfully logged in and Logout button is visible.');
  
      // Click the Logout button
      cy.xpath(logoutButtonXPath)
        .click();
  
      // Verify redirection back to the login page after logout
      cy.url().should('eq', 'http://localhost:3000/login');
  
      cy.log('Successfully logged out and redirected to the login page.');
  });
  

  it('fails to log in with wrong password and checks for error message', () => {
      // Function to perform login
      const loginUser = (username, password) => {
        // Assume these are the XPaths for the login fields and button
        const usernameXPath = '//*[@id="root"]/div/div/section/div/div/div[2]/form/div[2]/input';
        const passwordXPath = '//*[@id="root"]/div/div/section/div/div/div[2]/form/div[3]/input';
        const loginButtonXPath = '//*[@id="root"]/div/div/section/div/div/div[2]/form/div[5]/button';
        
        // Type credentials into the login form
        cy.xpath(usernameXPath)
          .should('be.visible')
          .type(username);
        
        cy.xpath(passwordXPath)
          .should('be.visible')
          .type(password);
        
        // Click the login button
        cy.xpath(loginButtonXPath)
          .should('be.visible')
          .click();
      };
  
      // Visit the login page
      cy.visit('http://localhost:3000/login');
  
      // Perform login with wrong password
      loginUser('valid_email@example.com', 'wrongPassword2025');
  
      // Verify that URL does not change to the homepage
      cy.url().should('eq', 'http://localhost:3000/login');
  
      // Verify an error message is displayed upon incorrect login attempt
      const errorMessageXPath = '//*[@id="root"]/div/div/section/div/div/div[2]/form/div[1]/div';
      cy.xpath(errorMessageXPath)
        .should('be.visible')
        .and(($message) => {
          expect($message.text().trim()).to.equal('Invalid credentials');
        });
  
      cy.log('Login failed with wrong password, error message is displayed.');
  });
  

  it('simulates successful registration and performs post-registration task', () => {
    // Visit the registration page
    cy.visit('http://localhost:3000/');
    
    // Click on the specified link/button using XPath to navigate to the registration form
    cy.xpath('//*[@id="root"]/div/div/section/div/div/div[2]/form/div[5]/p/a')
      .should('be.visible')
      .click();

    // Function call for performing registration with valid details
    registerUser('valid_username2', 'valid_email2@example.com', 'StrongPassword2025@@', null);

    // Perform post-registration actions

    // Enter text in the title input field
    cy.get('#title')
      .should('be.visible')
      .type('My New Task Title');

    // Enter text in the description input field
    cy.get('#description')
      .should('be.visible')
      .type('This is a detailed description of my new task.');

    // Click on the submission button to add a new task
    cy.get('.bg-blue-700')
      .should('be.visible')
      .click();

    // Optional: Add assertions to verify that the new task was added successfully
    cy.get('.outlet')  // Assuming there's an element with this class showing tasks
      .should('contain.text', 'My New Task Title')
      .and('contain.text', 'This is a detailed description of my new task.');
  });

  it('completes multiple tasks and verifies they appear in completed list', () => {
    // Helper function for typing into fields
    const typeInField = (selector, text) => {
      cy.get(selector).should('be.visible').type(text);
    };
  
    // Helper function to check task presence
    const checkTaskPresence = (taskTitle, taskDescription) => {
      cy.get('.outlet')
        .should('contain.text', taskTitle)
        .and('contain.text', taskDescription);
    };
  
    const loginUser = (username, password) => {
        // Assume these are the XPaths for the login fields and button
        const usernameXPath = '//*[@id="root"]/div/div/section/div/div/div[2]/form/div[2]/input';
        const passwordXPath = '//*[@id="root"]/div/div/section/div/div/div[2]/form/div[3]/input';
        const loginButtonXPath = '//*[@id="root"]/div/div/section/div/div/div[2]/form/div[5]/button';
        
        // Type credentials into the login form
        cy.xpath(usernameXPath)
          .should('be.visible')
          .type(username);
        
        cy.xpath(passwordXPath)
          .should('be.visible')
          .type(password);
        
        // Click the login button
        cy.xpath(loginButtonXPath)
          .should('be.visible')
          .click();
      };
  
      // Visit the login page
      cy.visit('http://localhost:3000/login');
  
      // Perform login
      loginUser('valid_email@example.com', 'StrongPassword2025@@');
  
      // Verify redirection to the homepage
      cy.url().should('eq', 'http://localhost:3000/');
    
    
    // Adding multiple tasks
    const tasks = [
      { title: 'Task One', description: 'Complete Task One' },
      { title: 'Task Two', description: 'Complete Task Two' },
      { title: 'Task Three', description: 'Complete Task Three' },
      { title: 'Task Four', description: 'Complete Task Four' },
      { title: 'Task Five', description: 'Complete Task Five' }
    ];
    
    tasks.forEach(({ title, description }) => {
      typeInField('#title', title);
      typeInField('#description', description);
      cy.get('.flex > .bg-blue-700').should('be.visible').click();      
      // Wait each time a task is added
      cy.wait(1000);
      checkTaskPresence(title, description);
    });
    
    // Mark all tasks as completed
    cy.get('.checkbox').should('be.visible').each(($checkbox) => {
      cy.wrap($checkbox).click();
    });
  
    // Wait for the completion action to process
    cy.wait(1000);
  
    // Navigate to the completed tasks list
    cy.get(':nth-child(3) > a').should('be.visible').click();
  
    // Verify that all completed tasks appear in the completed list
    tasks.forEach(({ title, description }) => {
      checkTaskPresence(title, description);
    });
  
    cy.log('Tasks successfully marked as completed and found in completed list.');
  });


  it('delete multiple tasks and verifies they appear in completed list', () => {
    // Helper function for typing into fields
    const typeInField = (selector, text) => {
      cy.get(selector).should('be.visible').type(text);
    };
  
    // Helper function to check task presence
    const checkTaskPresence = (taskTitle, taskDescription) => {
      cy.get('.outlet')
        .should('contain.text', taskTitle)
        .and('contain.text', taskDescription);
    };

    // Helper function to check task absence
    const checkTaskAbsent = (taskTitle, taskDescription) => {
      cy.get('.outlet')
        .should('not.contain.text', taskTitle)
        .and('not.contain.text', taskDescription);
    };
    
  
    const loginUser = (username, password) => {
        // Assume these are the XPaths for the login fields and button
        const usernameXPath = '//*[@id="root"]/div/div/section/div/div/div[2]/form/div[2]/input';
        const passwordXPath = '//*[@id="root"]/div/div/section/div/div/div[2]/form/div[3]/input';
        const loginButtonXPath = '//*[@id="root"]/div/div/section/div/div/div[2]/form/div[5]/button';
        
        // Type credentials into the login form
        cy.xpath(usernameXPath)
          .should('be.visible')
          .type(username);
        
        cy.xpath(passwordXPath)
          .should('be.visible')
          .type(password);
        
        // Click the login button
        cy.xpath(loginButtonXPath)
          .should('be.visible')
          .click();
      };
  
      // Visit the login page
      cy.visit('http://localhost:3000/login');
  
      // Perform login
      loginUser('valid_email@example.com', 'StrongPassword2025@@');
  
      // Verify redirection to the homepage
      cy.url().should('eq', 'http://localhost:3000/');
    
    
    // Adding multiple tasks
    const tasks = [
      { title: 'Task One', description: 'Complete Task One' },
      { title: 'Task Two', description: 'Complete Task Two' },
      { title: 'Task Three', description: 'Complete Task Three' },
      { title: 'Task Four', description: 'Complete Task Four' },
      { title: 'Task Five', description: 'Complete Task Five' }
    ];
    
    tasks.forEach(({ title, description }) => {
      typeInField('#title', title);
      typeInField('#description', description);
      cy.get('.flex > .bg-blue-700').should('be.visible').click();      
      // Wait each time a task is added
      cy.wait(1000);
      checkTaskPresence(title, description);
    });
    
    // // Mark all tasks as completed
    // cy.get(':nth-child(3) > .remove-task > [data-testid="DeleteIcon"]')
    //  .should('be.visible').each(($button) => {
    //   cy.wrap($button).click();
    // });

    // Click all instances of the specified SVG element
    tasks.forEach(({ title, description }, index) => {
      // Use the index to target each child dynamically
      cy.get(`:nth-child(${index + 1}) > .remove-task`)
        .should('be.visible')
        .click();
    });

    // Click all instances of the specified SVG element for other left over task from previous test
    for (let index = tasks.length - 1; index >= 0; index--) {
      // Use the index to target each child dynamically
      cy.get(`:nth-child(${index + 1}) > .remove-task`)
        .should('be.visible')
        .click();
    }
    
    
    
  
    // Wait for the completion action to process
    cy.wait(1000);
  
    // Navigate to the completed tasks list
    cy.get(':nth-child(2) > a').should('be.visible').click();
  
    // Verify that all completed tasks appear in the completed list
    tasks.forEach(({ title, description }) => {
      checkTaskAbsent(title, description);
    });
  
    cy.log('Tasks successfully marked as completed and found in completed list.');
  });

});