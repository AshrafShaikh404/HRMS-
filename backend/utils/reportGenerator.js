const { createObjectCsvWriter } = require('csv-writer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}

/**
 * Generate CSV file from data
 */
const generateCSV = async (data, headers, filename) => {
    const filePath = path.join(reportsDir, filename);

    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: headers
    });

    await csvWriter.writeRecords(data);
    return filePath;
};

/**
 * Generate PDF report
 */
const generatePDF = async (title, headers, data, filename, options = {}) => {
    const filePath = path.join(reportsDir, filename);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Header
    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown();

    // Company info (if provided)
    if (options.companyName) {
        doc.fontSize(10).text(options.companyName, { align: 'center' });
    }

    // Date range (if provided)
    if (options.dateRange) {
        doc.fontSize(10).text(options.dateRange, { align: 'center' });
    }

    doc.moveDown();
    doc.fontSize(10);

    // Draw table
    const tableTop = doc.y;
    const itemHeight = 25;
    const columnWidth = (doc.page.width - 100) / headers.length;

    // Table headers
    let xPosition = 50;
    headers.forEach(header => {
        doc.rect(xPosition, tableTop, columnWidth, itemHeight).stroke();
        doc.text(header.title, xPosition + 5, tableTop + 8, {
            width: columnWidth - 10,
            align: 'left'
        });
        xPosition += columnWidth;
    });

    // Table data
    let yPosition = tableTop + itemHeight;
    data.forEach((row, index) => {
        xPosition = 50;

        // Alternate row colors
        if (index % 2 === 0) {
            doc.rect(50, yPosition, doc.page.width - 100, itemHeight).fillAndStroke('#f5f5f5', '#000');
        }

        headers.forEach(header => {
            doc.rect(xPosition, yPosition, columnWidth, itemHeight).stroke();
            const value = row[header.key] !== undefined ? String(row[header.key]) : '';
            doc.fillColor('#000').text(value, xPosition + 5, yPosition + 8, {
                width: columnWidth - 10,
                align: header.align || 'left'
            });
            xPosition += columnWidth;
        });

        yPosition += itemHeight;

        // Add new page if needed
        if (yPosition > doc.page.height - 100) {
            doc.addPage();
            yPosition = 50;
        }
    });

    // Summary section (if provided)
    if (options.summary) {
        doc.moveDown();
        doc.fontSize(12).text('Summary:', { underline: true });
        doc.fontSize(10);
        Object.keys(options.summary).forEach(key => {
            doc.text(`${key}: ${options.summary[key]}`);
        });
    }

    // Footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).text(
            `Page ${i + 1} of ${pageCount}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
        );
        doc.text(
            `Generated on: ${new Date().toLocaleString()}`,
            50,
            doc.page.height - 35,
            { align: 'center' }
        );
    }

    doc.end();

    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
};

/**
 * Delete report file after sending
 */
const deleteReport = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

/**
 * Format date for display
 */
const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};

/**
 * Format currency
 */
const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
};

module.exports = {
    generateCSV,
    generatePDF,
    deleteReport,
    formatDate,
    formatCurrency,
    reportsDir
};
