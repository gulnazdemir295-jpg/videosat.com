/**
 * Responsive Tables Handler
 * Automatically converts tables to card layout on mobile devices
 */

(function() {
    'use strict';

    // Initialize responsive tables
    function initResponsiveTables() {
        const tables = document.querySelectorAll('table.admin-table, table.data-table, table.responsive-table');
        
        tables.forEach(table => {
            makeTableResponsive(table);
        });
    }

    // Make a table responsive
    function makeTableResponsive(table) {
        // Get header cells
        const headerCells = table.querySelectorAll('thead th');
        const headerTexts = Array.from(headerCells).map(th => th.textContent.trim());
        
        // Add data-label attributes to all td elements
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (headerTexts[index]) {
                    // Skip checkbox cells
                    if (cell.querySelector('input[type="checkbox"]')) {
                        return;
                    }
                    cell.setAttribute('data-label', headerTexts[index]);
                }
            });
        });
        
        // Add responsive class if not present
        if (!table.classList.contains('responsive-table')) {
            table.classList.add('responsive-table');
        }
        
        // Wrap table in container if not already wrapped
        if (!table.parentElement.classList.contains('table-container')) {
            const container = document.createElement('div');
            container.className = 'table-container';
            table.parentNode.insertBefore(container, table);
            container.appendChild(table);
        }
    }

    // Update table when content changes (for dynamically loaded tables)
    function updateResponsiveTable(table) {
        makeTableResponsive(table);
    }

    // Create card view from table (alternative approach)
    function createCardViewFromTable(table) {
        const headerCells = table.querySelectorAll('thead th');
        const headerTexts = Array.from(headerCells).map(th => th.textContent.trim());
        const rows = table.querySelectorAll('tbody tr');
        
        const cardContainer = document.createElement('div');
        cardContainer.className = 'table-card-view';
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const card = document.createElement('div');
            card.className = 'table-card';
            
            // Card header (first column or title)
            const cardHeader = document.createElement('div');
            cardHeader.className = 'table-card-header';
            const cardTitle = document.createElement('div');
            cardTitle.className = 'table-card-title';
            cardTitle.textContent = cells[0] ? cells[0].textContent.trim() : 'Item';
            cardHeader.appendChild(cardTitle);
            card.appendChild(cardHeader);
            
            // Card body
            const cardBody = document.createElement('div');
            cardBody.className = 'table-card-body';
            
            cells.forEach((cell, index) => {
                if (index === 0) return; // Skip first cell (title)
                if (!headerTexts[index]) return;
                
                const row = document.createElement('div');
                row.className = 'table-card-row';
                
                const label = document.createElement('div');
                label.className = 'table-card-label';
                label.textContent = headerTexts[index];
                
                const value = document.createElement('div');
                value.className = 'table-card-value';
                value.innerHTML = cell.innerHTML;
                
                row.appendChild(label);
                row.appendChild(value);
                cardBody.appendChild(row);
            });
            
            card.appendChild(cardBody);
            cardContainer.appendChild(card);
        });
        
        return cardContainer;
    }

    // Toggle between table and card view
    function toggleTableView(table, showCards) {
        const tableContainer = table.closest('.table-container');
        if (!tableContainer) return;
        
        // Remove existing card view
        const existingCardView = tableContainer.querySelector('.table-card-view');
        if (existingCardView) {
            existingCardView.remove();
        }
        
        if (showCards && window.innerWidth <= 768) {
            // Hide table, show cards
            table.style.display = 'none';
            const cardView = createCardViewFromTable(table);
            tableContainer.appendChild(cardView);
        } else {
            // Show table, hide cards
            table.style.display = '';
            if (existingCardView) {
                existingCardView.remove();
            }
        }
    }

    // Watch for dynamically added tables
    function watchForNewTables() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Check if node is a table
                        if (node.tagName === 'TABLE') {
                            makeTableResponsive(node);
                        }
                        // Check if node contains tables
                        const tables = node.querySelectorAll ? node.querySelectorAll('table') : [];
                        tables.forEach(table => {
                            makeTableResponsive(table);
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initResponsiveTables();
            watchForNewTables();
        });
    } else {
        initResponsiveTables();
        watchForNewTables();
    }

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Re-initialize tables on resize
            initResponsiveTables();
        }, 250);
    });

    // Export functions for global use
    window.responsiveTables = {
        init: initResponsiveTables,
        makeTableResponsive: makeTableResponsive,
        updateTable: updateResponsiveTable,
        toggleView: toggleTableView,
        createCardView: createCardViewFromTable
    };

})();

