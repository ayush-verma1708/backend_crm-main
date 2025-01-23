import Record from '../models/Record.js';
import User from '../models/userInfo.js';
import Joi from 'joi';

// Validation schema for records
const recordSchema = Joi.object({
  'First Name': Joi.string().required(),
  'Last Name': Joi.string().required(),
  Magazine: Joi.string().required(),
  Amount: Joi.number().required(),
  Email: Joi.string().email().required(),
  'Model Insta Link 1': Joi.string().uri().required(),
  LeadSource: Joi.string().optional(),
  Notes: Joi.string().optional(),
});

// export const getRecords = async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 10;
//   const search = req.query.search || '';
//   const minPrice = parseFloat(req.query.minPrice);
//   const maxPrice = parseFloat(req.query.maxPrice);
//   const magazineName = req.query.magazine || '';

//   try {
//     const skip = (page - 1) * limit;

//     // Create a dynamic filter to apply search across all string fields
//     const filter = {
//       $or: Object.keys(Record.schema.paths)
//         .filter((key) => Record.schema.paths[key].instance === 'String') // Only include String fields
//         .map((key) => ({
//           [key]: { $regex: search, $options: 'i' },
//         })),
//       Full_Name: { $ne: 'undefined undefined' }, // Exclude records with Full_Name as 'undefined undefined'
//     };

//     // Add magazine filter if specified
//     if (magazineName) {
//       filter.Magazine = { $regex: magazineName, $options: 'i' }; // Assuming 'Magazine' is the field in your schema
//     }

//     // Add price range filtering
//     if (!isNaN(minPrice) && !isNaN(maxPrice)) {
//       filter.Amount = { $gte: minPrice, $lte: maxPrice };
//     } else if (!isNaN(minPrice)) {
//       filter.Amount = { $gte: minPrice };
//     } else if (!isNaN(maxPrice)) {
//       filter.Amount = { $lte: maxPrice };
//     }

//     // Fetch records with pagination and the constructed filter
//     const records = await Record.find(filter).skip(skip).limit(limit).lean();
//     const totalRecords = await Record.countDocuments(filter);

//     // Calculate the total sum of the Amount field
//     const totalAmount = await Record.aggregate([
//       { $match: filter }, // Apply the same filter
//       { $group: { _id: null, totalAmount: { $sum: '$Amount' } } },
//     ]);

//     // Extract the totalAmount value or default to 0 if no records match
//     const sumOfAmount = totalAmount.length > 0 ? totalAmount[0].totalAmount : 0;

//     // Calculate total sales (sum of amounts) for each magazine
//     const magazineSales = await Record.aggregate([
//       { $match: filter }, // Apply the same filter
//       {
//         $group: {
//           _id: '$Magazine', // Group by magazine name
//           totalSales: { $sum: '$Amount' }, // Sum up the amounts for each magazine
//         },
//       },
//       { $sort: { totalSales: -1 } }, // Optional: Sort magazines by sales in descending order
//     ]);

//     // Calculate magazine-wise count
//     const magazineCounts = await Record.aggregate([
//       { $match: filter }, // Apply the same filter
//       {
//         $group: {
//           _id: '$Magazine', // Group by magazine name
//           count: { $sum: 1 }, // Count the number of records for each magazine
//         },
//       },
//       { $sort: { count: -1 } }, // Optional: Sort by count in descending order
//     ]);

//     // Extract unique email addresses from records
//     const emailAddresses = records
//       .map((record) => record.Email)
//       .filter(Boolean); // Filter out any falsy values

//     const fullNames = records.map((record) => record.Full_Name).filter(Boolean); // Filter out any falsy values

//     // Fetch user information based on email addresses and full names
//     const users = await User.find({
//       $or: [
//         { Email_Address: { $in: emailAddresses } },
//         { Stage_Name: { $in: fullNames } },
//       ],
//     });

//     const userMap = {};
//     users.forEach((user) => {
//       if (user.Email_Address) userMap[user.Email_Address] = user; // Match by email
//       if (user.Stage_Name) userMap[user.Stage_Name] = user; // Match by stage name
//     });

//     // Combine records with user information
//     const enrichedRecords = records.map((record) => {
//       return {
//         ...record,
//         user_info: userMap[record.Email] || userMap[record.Full_Name] || null, // Match based on email
//       };
//     });

//     res.json({
//       totalRecords,
//       page,
//       totalPages: Math.ceil(totalRecords / limit),
//       totalAmount: sumOfAmount,
//       magazineSales, // Include sales per magazine
//       magazineCounts, // Include count per magazine
//       records: enrichedRecords,
//     });
//   } catch (err) {
//     res.status(500).json({ error: `Error retrieving records: ${err.message}` });
//   }
// };
export const getRecords = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const minPrice = parseFloat(req.query.minPrice);
  const maxPrice = parseFloat(req.query.maxPrice);
  const magazineName = req.query.magazine || '';

  try {
    // Create a dynamic filter to apply search across all string fields
    const filter = {
      $or: Object.keys(Record.schema.paths)
        .filter((key) => Record.schema.paths[key].instance === 'String') // Only include String fields
        .map((key) => ({
          [key]: { $regex: search, $options: 'i' },
        })),
      Full_Name: { $ne: 'undefined undefined' }, // Exclude records with Full_Name as 'undefined undefined'
    };

    // Add magazine filter if specified
    if (magazineName) {
      filter.Magazine = { $regex: magazineName, $options: 'i' }; // Assuming 'Magazine' is the field in your schema
    }

    // Apply the filters and get the filtered records
    const filteredRecords = await Record.find(filter).lean();

    // // Merge records by email or Full_Name (or any other unique identifier)
    // const mergedRecords = {};
    // filteredRecords.forEach((record) => {
    //   const identifier = record.Email || record.Full_Name; // Using Email or Full_Name as identifier

    //   if (mergedRecords[identifier]) {
    //     // Merge the existing record with the current one
    //     mergedRecords[identifier].Amount += record.Amount || 0;
    //     mergedRecords[identifier].Product += `, ${record.Product}`;
    //     mergedRecords[identifier].Magazine += `, ${record.Magazine}`;
    //     mergedRecords[identifier].Quantity += record.Quantity || 0;
    //     mergedRecords[identifier].Notes += `, ${record.Notes || ''}`;
    //     // Add other fields as needed
    //   } else {
    //     // If no previous record, add it
    //     mergedRecords[identifier] = { ...record };
    //   }
    // });
// Merge records by email or Full_Name (or any other unique identifier)
const mergedRecords = {};
filteredRecords.forEach((record) => {
  const identifier = record.Email || record.Full_Name; // Using Email or Full_Name as identifier

  if (mergedRecords[identifier]) {
    // Merge the existing record with the current one
    if (record.Status === 'Successful') {
      mergedRecords[identifier].Amount += record.Amount || 0; // Add amount only if status is 'Successful'
      mergedRecords[identifier].Magazine += `, ${record.Magazine}`;
      mergedRecords[identifier].Product += `, ${record.Product}`;
    }
    mergedRecords[identifier].Quantity += record.Quantity || 0;
    mergedRecords[identifier].Notes += `, ${record.Notes || ''}`;
    // Add other fields as needed
  } else {
    // If no previous record, add it
    mergedRecords[identifier] = { ...record };

    // Set the initial amount only if the status is 'Successful'
    mergedRecords[identifier].Amount = record.Status === 'Successful' ? record.Amount || 0 : 0;
  }
});

    // Convert mergedRecords object back to an array
    const finalRecords = Object.values(mergedRecords);

    // Apply price range filtering on the merged records
    const filteredMergedRecords = finalRecords.filter((record) => {
      let isValid = true;
      if (!isNaN(minPrice) && record.Amount < minPrice) isValid = false;
      if (!isNaN(maxPrice) && record.Amount > maxPrice) isValid = false;
      return isValid;
    });

    // Paginate the filtered merged records
    const skip = (page - 1) * limit;
    const paginatedRecords = filteredMergedRecords.slice(skip, skip + limit);
    const totalRecords = filteredMergedRecords.length;

    // Calculate the total sum of the Amount field (apply min and max price conditions after filtering)
  // Calculate the total sum of the Amount field (apply min and max price conditions after filtering)
  const totalAmount = await Record.aggregate([
    {
      $match: {
        ...filter,
        Status: 'Successful', // Include only records with "Successful" payment status
      },
    },
    { $group: { _id: null, totalAmount: { $sum: '$Amount' } } },
  ]);
    // Extract the totalAmount value or default to 0 if no records match
    const sumOfAmount = totalAmount.length > 0 ? totalAmount[0].totalAmount : 0;

    // Calculate total sales (sum of amounts) for each magazine
    // const magazineSales = await Record.aggregate([
    //   { $match: filter }, // Apply the same filter
    //   {
    //     $group: {
    //       _id: '$Magazine', // Group by magazine name
    //       totalSales: { $sum: '$Amount' }, // Sum up the amounts for each magazine
    //     },
    //   },
    //   { $sort: { totalSales: -1 } }, // Optional: Sort magazines by sales in descending order
    // ]);
    const magazineSales = await Record.aggregate([
      {
        $match: {
          ...filter,
          Status: 'Successful', // Include only "Successful" payments
        },
      },
      {
        $group: {
          _id: '$Magazine', // Group by magazine name
          totalSales: { $sum: '$Amount' }, // Sum up the amounts for each magazine
        },
      },
      { $sort: { totalSales: -1 } }, // Optional: Sort magazines by sales in descending order
    ]);
    // Calculate magazine-wise count
    const magazineCounts = await Record.aggregate([
      { $match: filter }, // Apply the same filter
      {
        $group: {
          _id: '$Magazine', // Group by magazine name
          count: { $sum: 1 }, // Count the number of records for each magazine
        },
      },
      { $sort: { count: -1 } }, // Optional: Sort by count in descending order
    ]);

    // Extract unique email addresses from records
    const emailAddresses = filteredMergedRecords
      .map((record) => record.Email)
      .filter(Boolean); // Filter out any falsy values

    const fullNames = filteredMergedRecords.map((record) => record.Full_Name).filter(Boolean); // Filter out any falsy values

    // Fetch user information based on email addresses and full names
    const users = await User.find({
      $or: [
        { Email_Address: { $in: emailAddresses } },
        { Stage_Name: { $in: fullNames } },
      ],
    });

    const userMap = {};
    users.forEach((user) => {
      if (user.Email_Address) userMap[user.Email_Address] = user; // Match by email
      if (user.Stage_Name) userMap[user.Stage_Name] = user; // Match by stage name
    });

    // Combine records with user information
    const enrichedRecords = paginatedRecords.map((record) => {
      return {
        ...record,
        user_info: userMap[record.Email] || userMap[record.Full_Name] || null, // Match based on email
      };
    });

    res.json({
      totalRecords,
      page,
      totalPages: Math.ceil(totalRecords / limit),
      totalAmount: sumOfAmount,
      magazineSales, // Include sales per magazine
      magazineCounts, // Include count per magazine
      records: enrichedRecords,
    });
  } catch (err) {
    res.status(500).json({ error: `Error retrieving records: ${err.message}` });
  }
};

// export const getRecords = async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 10;
//   const search = req.query.search || '';
//   const minPrice = parseFloat(req.query.minPrice);
//   const maxPrice = parseFloat(req.query.maxPrice);
//   const magazineName = req.query.magazine || '';

//   try {
//     // Create a dynamic filter to apply search across all string fields
//     const filter = {
//       $or: Object.keys(Record.schema.paths)
//         .filter((key) => Record.schema.paths[key].instance === 'String') // Only include String fields
//         .map((key) => ({
//           [key]: { $regex: search, $options: 'i' },
//         })),
//       Full_Name: { $ne: 'undefined undefined' }, // Exclude records with Full_Name as 'undefined undefined'
//     };


//     // Add magazine filter if specified
//     if (magazineName) {
//       filter.Magazine = { $regex: magazineName, $options: 'i' }; // Assuming 'Magazine' is the field in your schema
//     }

//     // Apply price range filtering before pagination
//     if (!isNaN(minPrice) && !isNaN(maxPrice)) {
//       filter.Amount = { $gte: minPrice, $lte: maxPrice };
//     } else if (!isNaN(minPrice)) {
//       filter.Amount = { $gte: minPrice };
//     } else if (!isNaN(maxPrice)) {
//       filter.Amount = { $lte: maxPrice };
//     }

//     // Apply the filters and get the filtered records
//     const filteredRecords = await Record.find(filter).lean();

//      // Merge records by email or Full_Name (or any other unique identifier)
//      const mergedRecords = {};
//      filteredRecords.forEach((record) => {
//        const identifier = record.Email || record.Full_Name; // Using Email or Full_Name as identifier
 
//        if (mergedRecords[identifier]) {
//          // Merge the existing record with the current one
//          mergedRecords[identifier].Amount += record.Amount || 0;
//          mergedRecords[identifier].Product += `, ${record.Product}`;
//          mergedRecords[identifier].Magazine += `, ${record.Magazine}`;
//          mergedRecords[identifier].Quantity += record.Quantity || 0;
//          mergedRecords[identifier].Notes += `, ${record.Notes || ''}`;
//          // Add other fields as needed
//        } else {
//          // If no previous record, add it
//          mergedRecords[identifier] = { ...record };
//        }
//      });
//      // Convert mergedRecords object back to an array
//     const finalRecords = Object.values(mergedRecords);


//     // Paginate the filtered records
//     const skip = (page - 1) * limit;
//     const paginatedRecords = finalRecords.slice(skip, skip + limit);
//     const totalRecords = finalRecords.length;

//     // Calculate the total sum of the Amount field (apply min and max price conditions after filtering)
//     const totalAmount = await Record.aggregate([
//       { $match: filter }, // Apply the same filter
//       { $group: { _id: null, totalAmount: { $sum: '$Amount' } } },
//     ]);

//     // Extract the totalAmount value or default to 0 if no records match
//     const sumOfAmount = totalAmount.length > 0 ? totalAmount[0].totalAmount : 0;

//     // Calculate total sales (sum of amounts) for each magazine
//     const magazineSales = await Record.aggregate([
//       { $match: filter }, // Apply the same filter
//       {
//         $group: {
//           _id: '$Magazine', // Group by magazine name
//           totalSales: { $sum: '$Amount' }, // Sum up the amounts for each magazine
//         },
//       },
//       { $sort: { totalSales: -1 } }, // Optional: Sort magazines by sales in descending order
//     ]);

//     // Calculate magazine-wise count
//     const magazineCounts = await Record.aggregate([
//       { $match: filter }, // Apply the same filter
//       {
//         $group: {
//           _id: '$Magazine', // Group by magazine name
//           count: { $sum: 1 }, // Count the number of records for each magazine
//         },
//       },
//       { $sort: { count: -1 } }, // Optional: Sort by count in descending order
//     ]);

//     // Extract unique email addresses from records
//     const emailAddresses = filteredRecords
//       .map((record) => record.Email)
//       .filter(Boolean); // Filter out any falsy values

//     const fullNames = filteredRecords.map((record) => record.Full_Name).filter(Boolean); // Filter out any falsy values

//     // Fetch user information based on email addresses and full names
//     const users = await User.find({
//       $or: [
//         { Email_Address: { $in: emailAddresses } },
//         { Stage_Name: { $in: fullNames } },
//       ],
//     });

//     const userMap = {};
//     users.forEach((user) => {
//       if (user.Email_Address) userMap[user.Email_Address] = user; // Match by email
//       if (user.Stage_Name) userMap[user.Stage_Name] = user; // Match by stage name
//     });

//     // Combine records with user information
//     const enrichedRecords = paginatedRecords.map((record) => {
//       return {
//         ...record,
//         user_info: userMap[record.Email] || userMap[record.Full_Name] || null, // Match based on email
//       };
//     });

//     res.json({
//       totalRecords,
//       page,
//       totalPages: Math.ceil(totalRecords / limit),
//       totalAmount: sumOfAmount,
//       magazineSales, // Include sales per magazine
//       magazineCounts, // Include count per magazine
//       records: enrichedRecords,
//     });
//   } catch (err) {
//     res.status(500).json({ error: `Error retrieving records: ${err.message}` });
//   }
// };



export const createRecord = async (req, res) => {
  const { error } = recordSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const record = new Record(req.body);
    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRecordById = async (req, res) => {
  try {
    // Fetch the record by ID
    const record = await Record.findById(req.params.id).lean();

    // Check if the record exists
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Fetch all records with the same email address from the Record collection
    const sameEmailRecords = await Record.find({ Email: record.Email }).lean();

    // Fetch user details from the User collection where the email matches
    const userDetails = await User.findOne({
      Email_Address: record.Email,
    }).lean();

    // Return the record, same email records, and user details
    res.json({ record, sameEmailRecords, userDetails });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateRecordNotes = async (req, res) => {
  const { note, noteDate } = req.body; // Extracting note and noteDate from the request body

  try {
    const record = await Record.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });

    record.Notes = note; // Update the notes
    record.NoteDate = noteDate; // Assuming NoteDate field exists in your schema

    await record.save();
    res.status(200).json({ message: 'Note updated successfully', record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a record
export const deleteRecord = async (req, res) => {
  try {
    const deletedRecord = await Record.findByIdAndDelete(req.params.id).lean();
    if (!deletedRecord)
      return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// import Record from '../models/Record.js';
// import User from '../models/userInfo.js';
// import Joi from 'joi';

// // Validation schema for records
// const recordSchema = Joi.object({
//   'First Name': Joi.string().required(),
//   'Last Name': Joi.string().required(),
//   Magazine: Joi.string().required(),
//   Amount: Joi.number().required(),
//   Email: Joi.string().email().required(),
//   'Model Insta Link 1': Joi.string().uri().required(),
//   LeadSource: Joi.string().optional(),
//   Notes: Joi.string().optional(),
// });

// import cache from 'memory-cache'; // Assuming memory-cache is already installed and configured

// export const getRecords = async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 200;
//   const search = req.query.search || '';
//   const minPrice = parseFloat(req.query.minPrice);
//   const maxPrice = parseFloat(req.query.maxPrice);
//   const magazineName = req.query.magazine || '';

//   try {
//     // Create a dynamic filter to apply search across all string fields
//     const filter = {
//       $or: Object.keys(Record.schema.paths)
//         .filter((key) => Record.schema.paths[key].instance === 'String') // Only include String fields
//         .map((key) => ({
//           [key]: { $regex: search, $options: 'i' },
//         })),
//       Full_Name: { $ne: 'undefined undefined' }, // Exclude records with Full_Name as 'undefined undefined'
//     };

//     // Add magazine filter if specified
//     if (magazineName) {
//       filter.Magazine = { $regex: magazineName, $options: 'i' };
//     }

//     // Add price range filtering (combined minPrice and maxPrice)
//     if (!isNaN(minPrice) && !isNaN(maxPrice)) {
//       filter.Amount = { $gte: minPrice, $lte: maxPrice };
//     } else if (!isNaN(minPrice)) {
//       filter.Amount = { $gte: minPrice };
//     } else if (!isNaN(maxPrice)) {
//       filter.Amount = { $lte: maxPrice };
//     }

//     // Create a cache key based on the query parameters and filter
//     const cacheKey = `getRecords_${JSON.stringify(req.query)}_${JSON.stringify(
//       filter
//     )}`;

//     // Check if the data is cached
//     const cachedData = cache.get(cacheKey);
//     if (cachedData) {
//       return res.json(cachedData); // Return cached data if it exists
//     }

//     // Apply MongoDB pagination with filtering
//     const skip = (page - 1) * limit;

//     // Fetch records with applied filter and pagination
//     const records = await Record.find(filter).skip(skip).limit(limit).lean();

//     // Calculate the total number of records with the same filter (no pagination)
//     const totalRecords = await Record.countDocuments(filter); // Ensure totalRecords reflects the filter
//     const totalPages = Math.ceil(totalRecords / limit); // Recalculate total pages

//     // Calculate the total sum of the Amount field
//     const totalAmount = await Record.aggregate([
//       { $match: filter }, // Apply the same filter
//       { $group: { _id: null, totalAmount: { $sum: '$Amount' } } },
//     ]);

//     // Extract the totalAmount value or default to 0 if no records match
//     const sumOfAmount = totalAmount.length > 0 ? totalAmount[0].totalAmount : 0;

//     const responseData = {
//       totalRecords,
//       page,
//       totalPages,
//       totalAmount: sumOfAmount,
//       records,
//     };

//     // Cache the response data for 5 minutes (adjust as needed)
//     cache.put(cacheKey, responseData, 5 * 60 * 1000);

//     return res.json(responseData);
//   } catch (err) {
//     res.status(500).json({ error: `Error retrieving records: ${err.message}` });
//   }
// };

// export const createRecord = async (req, res) => {
//   const { error } = recordSchema.validate(req.body);
//   if (error) return res.status(400).json({ error: error.details[0].message });

//   try {
//     const record = new Record(req.body);
//     const savedRecord = await record.save();
//     res.status(201).json(savedRecord);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const getRecordById = async (req, res) => {
//   try {
//     // Fetch the record by ID
//     const record = await Record.findById(req.params.id).lean();

//     // Check if the record exists
//     if (!record) {
//       return res.status(404).json({ error: 'Record not found' });
//     }

//     // Fetch all records with the same email address from the Record collection
//     const sameEmailRecords = await Record.find({ Email: record.Email }).lean();

//     // Fetch user details from the User collection where the email matches
//     const userDetails = await User.findOne({
//       Email_Address: record.Email,
//     }).lean();

//     // Return the record, same email records, and user details
//     res.json({ record, sameEmailRecords, userDetails });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // export const updateRecord = async (req, res) => {
// //   const data = req.body;
// //   console.log('new updates to the data', data);
// //   const record = await Record.findById(req.params.id).lean();
// //   // Fetch all records with the same email address from the Record collection
// //   console.log('To update in primary record', record);

// //   const sameEmailRecords = await Record.find({ Email: record.Email }).lean();
// //   console.log('update in all the records for same user', sameEmailRecords);

// //   // Fetch user details from the User collection where the email matches
// //   const userDetails = await User.findOne({
// //     Email_Address: record.Email,
// //   }).lean();
// //   console.log('user details to update', userDetails);
// // };

export const updateRecord = async (req, res) => {
  try {
    const data = req.body;

    // Validate if data is JSON format
    if (typeof data !== 'object' || data === null) {
      return res.status(400).json({ message: 'Invalid JSON payload' });
    }

    console.log('New updates to the data:', data);

    // Update the primary record by ID
    const updatedRecord = await Record.findByIdAndUpdate(req.params.id, data, {
      new: true,
    }).lean();
    if (!updatedRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }

    console.log('Updated primary record:', updatedRecord);

    // Fetch all records with the same email address
    const sameEmailRecords = await Record.find({
      Email: updatedRecord.Email,
    }).lean();
    console.log('Records to update for the same user:', sameEmailRecords);

    // Update all records with the same email address
    await Promise.all(
      sameEmailRecords.map((record) => {
        return Record.findByIdAndUpdate(record._id, data, { new: true });
      })
    );

    // Fetch user details with the matching email
    const userDetails = await User.findOne({
      Email_Address: updatedRecord.Email,
    }).lean();
    console.log('User details before update:', userDetails);

    // Update user details if necessary
    if (userDetails) {
      const updatedUserDetails = {
        Model_Type: data.Model_Type || userDetails.Model_Type,
        Stage_Name: data.Stage_Name || userDetails.Stage_Name,
        Model_Insta_Link: data.Model_Insta_Link || userDetails.Model_Insta_Link,
        Email_Address: data.Email || userDetails.Email_Address,
      };

      await User.findByIdAndUpdate(userDetails._id, updatedUserDetails, {
        new: true,
      });
      console.log('User details updated:', updatedUserDetails);
    }

    res
      .status(200)
      .json({ message: 'Records and user details updated successfully' });
  } catch (error) {
    console.error('Error updating records:', error);
    res.status(500).json({ message: 'Error updating records', error });
  }
};

// export const updateRecordNotes = async (req, res) => {
//   const { note, noteDate } = req.body; // Extracting note and noteDate from the request body

//   try {
//     const record = await Record.findById(req.params.id);
//     if (!record) return res.status(404).json({ error: 'Record not found' });

//     record.Notes = note; // Update the notes
//     record.NoteDate = noteDate; // Assuming NoteDate field exists in your schema

//     await record.save();
//     res.status(200).json({ message: 'Note updated successfully', record });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Delete a record
// export const deleteRecord = async (req, res) => {
//   try {
//     const deletedRecord = await Record.findByIdAndDelete(req.params.id).lean();
//     if (!deletedRecord)
//       return res.status(404).json({ error: 'Record not found' });
//     res.json({ message: 'Record deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
