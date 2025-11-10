import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  RefreshCw,
  Calendar,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Search,
  Plus,
  ChevronsDown,
  Loader2,
  UserCircle,
  MapPin,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Send,
} from "lucide-react";
import { SideNav } from "../components/SideNav";
import {
  GeoapifyGeocoderAutocomplete,
  GeoapifyContext,
} from "@geoapify/react-geocoder-autocomplete";
import "@geoapify/geocoder-autocomplete/styles/minimal.css";
import LocationSelector from "../components/LocationSelector";

const CoffeeColors = {
  SCREEN_BG: "#FFF8F6",
  ACTIVE_LINK_BG: "#efebe9",
  ACTIVE_LINK_TEXT: "#783A1E",
  DARK_BROWN: "#4A3423",
  MEDIUM_BROWN: "#795548",
  BUTTON_BROWN: "#795548",
  GRAY_TEXT: "#8D8D8D",
  SUCCESS_GREEN: "#34A853",
  ERROR_RED: "#EA4335",
};

const STAFF_API_ENDPOINT = `${import.meta.env.VITE_API_URL}/api/staff/`;

const LOCATION_DATA = {
  Wakiso: [
    "Bussi Sub-County",
    "Kakiri Sub-County",
    "Kakiri Town Council",
    "Kasanje Sub-County",
    "Katabi Town Council",
    "Masuliita Sub-County",
    "Masulita Town Council",
    "Mende Sub-County",
    "Namayumba Sub-County",
    "Namayumba Town Council",
    "Kajjansi Town Council",
    "Wakiso Sub-County",
    "Wakiso Town Council",
    "Wakiso — Division A",
    "Wakiso — Division B",
    "Bweyogerere Division",
    "Kira Division",
    "Namugongo Division",
    "Kasangati Town Council",
    "Bunamwaya Division",
    "Masajja Division",
    "Ndejje Division",
    "Busukuma Division",
    "Gombe Division",
    "Nabweru Division",
    "Nansana Division",
    "Kyengera Town Council",
  ],
  Kampala: [
    "Kawempe Division",
    "Makindye Division",
    "Nakawa Division",
    "Rubaga Division",
    "Kampala Central Division",
    "Lubaga Division",
  ],
  Mukono: [
    "Mukono Municipality",
    "Mukono North Sub-County",
    "Mukono South Sub-County",
    "Seeta Sub-County",
    "Ssi Sub-County",
    "Goma Sub-County",
    "Semyebenye Sub-County",
  ],
  Luwero: [
    "Luwero Municipality",
    "Luwero Town Council",
    "Luwero Sub-County",
    "Wobulenzi Town Council",
    "Wahraka Sub-County",
    "Katikamu Sub-County",
    "Kamira Sub-County",
    "Madudu Sub-County",
  ],
  Mbale: [
    "Mbale Municipality",
    "Mbale Town Council",
    "Mbale Sub-County",
    "Busano Sub-County",
    "Namwezi Sub-County",
    "Bufuka Sub-County",
  ],
  Masaka: [
    "Masaka Municipality",
    "Masaka Town Council",
    "Masaka East Sub-County",
    "Masaka South Sub-County",
    "Kiyindi Sub-County",
    "Nyendo Sub-County",
    "Kasome Sub-County",
  ],
};

const PARISHES_BY_SUB_COUNTY = {
  "Bussi Sub-County": ["Balabala", "Bussi", "Gulwe", "Tebankiza", "Zzinga"],
  "Kakiri Sub-County": [
    "Kikandwa",
    "Luwunga",
    "Kamuli",
    "Sentema",
    "Lubbe",
    "Buwanuka",
    "Magoggo",
    "Nampunge",
  ],
  "Kakiri Town Council (parishes / wards)": [
    "Bukalango",
    "Busujja",
    "Kakiri",
    "Kikubampanga",
    "Lugeye",
    "Nakyelongoosa",
  ],
  "Kasanje Sub-County": [
    "Bulumbu",
    "Jjungo",
    "Kasanje",
    "Mako",
    "Sokolo",
    "Ssazi",
    "Zziba",
  ],
  "Katabi Town Council": ["Kabale", "Kisubi", "Kitala", "Nalugala", "Nkumba"],
  "Masuliita Sub-County": [
    "Bbale Mukwenda",
    "Kyengeza",
    "Lwemwedde",
    "Manze",
    "Nakikungube",
    "Tumbaali",
  ],
  "Masulita Town Council": [
    "Kabale",
    "Kanzize",
    "Katikamu",
    "Lugungudde",
    "Masulita",
  ],
  "Mende Sub-County": ["Bakka", "Banda", "Kaliiti", "Mende", "Namusera"],
  "Namayumba Sub-County": [
    "Bbembe",
    "Bukondo",
    "Kanziro",
    "Kitayita",
    "Kyasa",
    "Nakedde",
  ],
  "Namayumba Town Council": ["Kyampisi", "Kyanuuna", "Luguzi", "Luttisi"],
  "Kajjansi Town Council": [
    "Bulwanyi",
    "Bweya",
    "Kitende",
    "Nakawuka",
    "Namulanda",
    "Nankonge",
    "Ngongolo",
    "Nkungulutale",
    "Nsaggu",
    "Ssisa",
    "Wamala",
  ],
  "Wakiso Sub-County": [
    "Bukasa",
    "Buloba",
    "Kyebando",
    "Lukwanga",
    "Nakabugo",
    "Ssumbwe",
  ],
  "Wakiso Town Council": [
    "Gombe",
    "Kasengejje",
    "Kavumba",
    "Kisimbiri",
    "Mpunga",
    "Naluvule",
    "Namusera",
  ],
  "Wakiso — Division A (Wakiso Town Division A)": ["Central", "Katabi"],
  "Wakiso — Division B (Wakiso Town Division B)": ["Kigungu", "Kiwafu"],
  "Bweyogerere Division": ["Bweyogerere"],
  "Kira Division": ["Kimwanyi", "Kira"],
  "Namugongo Division": ["Kireka", "Kyaliwajjala"],
  "Kasangati Town Council": [
    "Bulamu",
    "Gayaza",
    "Kabubbu",
    "Katadde",
    "Kiteezi",
    "Masooli",
    "Nangabo",
    "Wampeewo",
    "Wattuba",
  ],
  "Bunamwaya Division": ["Bunamwaya", "Mutundwe"],
  "Masajja Division": ["Busabala", "Masajja", "Namasuba"],
  "Ndejje Division": ["Mutungo", "Ndejje", "Seguku"],
  "Busukuma Division": ["Busukuma", "Guluddene"],
  "Gombe Division": [
    "Buwambo",
    "Gombe",
    "Kavule",
    "Kiryamuli",
    "Matugga",
    "Migadde",
    "Mwereerwe",
    "Nasse",
    "Ssanga",
    "Tikalu",
    "Wambale",
  ],
  "Nabweru Division": ["Kawanda", "Maganjo", "Nakyesanja", "Wamala"],
  "Nansana Division": [
    "Ochieng",
    "Kazo",
    "Nabweru North",
    "Nabweru South",
    "Nansana East",
    "Nansana West",
  ],
  "Kyengera Town Council": [
    "Buddo",
    "Kasenge",
    "Katereke",
    "Kikajjo",
    "Kitemu-Kisozi",
    "Kyengera Town Board",
    "Maya",
    "Nabbingo",
    "Nanziga",
    "Nsangi",
  ],
  "Kawempe Division": ["Makerere", "Wandegeya", "Mulago", "Nansana"],
  "Makindye Division": ["Kibuli", "Makindye", "Nsambya", "Mengo"],
  "Nakawa Division": ["Bugolobi", "Mbuya", "Naguru", "Naalya"],
  "Rubaga Division": ["Rubaga", "Kabowa", "Kabalagala", "Nateete"],
  "Kampala Central Division": ["Central", "Komamboga", "Kisenyi"],
  "Lubaga Division": ["Lubaga", "Kasubi", "Mulago", "Wampewo"],
  "Mukono Municipality": ["Mukono Central", "Mukono East", "Mukono West"],
  "Mukono North Sub-County": ["Buwenda", "Lugazi", "Namike"],
  "Mukono South Sub-County": ["Bukungu", "Kiwoko", "Njeru"],
  "Seeta Sub-County": ["Seeta East", "Seeta West", "Balawoli"],
  "Ssi Sub-County": ["Ssi Central", "Ssi South"],
  "Goma Sub-County": ["Goma", "Nakyesanja"],
  "Semyebenye Sub-County": ["Semyebenye", "Kigula"],
  "Luwero Municipality": ["Luwero Town", "Luwero Central"],
  "Luwero Town Council": ["Town East", "Town West"],
  "Luwero Sub-County": ["Luwero Central", "Luwero South"],
  "Wobulenzi Town Council": ["Wobulenzi Central", "Wobulenzi West"],
  "Wahraka Sub-County": ["Wahraka Central", "Wahraka South"],
  "Katikamu Sub-County": ["Katikamu Central", "Katikamu North"],
  "Kamira Sub-County": ["Kamira East", "Kamira West"],
  "Madudu Sub-County": ["Madudu Central", "Madudu South"],
  "Mbale Municipality": ["Mbale Central", "Mbale East"],
  "Mbale Town Council": ["Mbale Town"],
  "Mbale Sub-County": ["Mbale North", "Mbale South"],
  "Busano Sub-County": ["Busano", "Simu"],
  "Namwezi Sub-County": ["Namwezi", "Buteza"],
  "Bufuka Sub-County": ["Bufuka", "Mutoto"],
  "Masaka Municipality": ["Masaka Central", "Masaka West"],
  "Masaka Town Council": ["Masaka Town"],
  "Masaka East Sub-County": ["Masaka East Central", "Masaka East South"],
  "Masaka South Sub-County": ["Masaka South Central", "Masaka South West"],
  "Kiyindi Sub-County": ["Kiyindi Central", "Kiyindi North"],
  "Nyendo Sub-County": ["Nyendo Central", "Nyendo East"],
  "Kasome Sub-County": ["Kasome Central", "Kasome East"],
};

const StaffEntryModal = ({ isOpen, onClose, staffData, onSave }) => {
  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const today = getTodayDate();

  const formatNumberWithCommas = (value) => {
    if (!value && value !== 0) return "";
    const num = value.toString().replace(/,/g, "");
    return Number(num).toLocaleString("en-US");
  };

  const normalizeStaff = (s) => {
    if (!s)
      return {
        first_name: "",
        last_name: "",
        gender: "",
        nin: "",
        district: "",
        subcounty: "",
        parish: "",
        village: "",
        employment_status: "",
        hire_date: today,
        monthly_salary: "",
      };
    return {
      first_name: s.first_name || "",
      last_name: s.last_name || "",
      gender: s.gender || "",
      nin: s.nin || "",
      district: s.district || "",
      subcounty: s.subcounty || s.sub_county || "",
      parish: s.parish || "",
      village: s.village || "",
      employment_status: s.employment_status || s.employment_type || "",
      hire_date: s.hire_date || s.date_hired || today,
      monthly_salary: s.monthly_salary
        ? formatNumberWithCommas(s.monthly_salary)
        : "",
    };
  };

  const [formData, setFormData] = useState(normalizeStaff(staffData));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validation, setValidation] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(normalizeStaff(staffData));
      setValidation({});
    }
  }, [isOpen, staffData]);

  const validateField = (name, value) => {
    const v = String(value || "").trim();
    switch (name) {
      case "first_name":
      case "last_name":
        return v.length >= 2;
      case "gender":
        return ["Male", "Female"].includes(value);
      case "nin":
        return v.length === 14 && /^(CM|CF)[A-Za-z0-9]{12}$/.test(v);
      case "district":
      case "subcounty":
      case "parish":
      case "village":
        return v.length > 0;
      case "monthly_salary":
        const rawSalary = v.replace(/,/g, "");
        if (rawSalary === "") return false;
        const salaryNum = parseFloat(rawSalary);
        return !isNaN(salaryNum) && salaryNum >= 0;
      case "employment_status":
        return ["Full-time", "Part-time", "Contract", "Seasonal"].includes(
          value
        );
      case "hire_date":
        if (!v.length) return false;
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        return v <= todayStr;
      default:
        return true;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev };
      if (name === "monthly_salary") {
        if (value && /^[0-9,]*$/.test(value)) {
          const rawValue = value.replace(/,/g, "");
          next[name] =
            rawValue === "" ? "" : Number(rawValue).toLocaleString("en-US");
        }
      } else {
        next[name] = value;
      }
      return next;
    });
    setValidation((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldsToCheck = [
      "first_name",
      "last_name",
      "gender",
      "nin",
      "district",
      "subcounty",
      "parish",
      "village",
      "employment_status",
      "hire_date",
      "monthly_salary",
    ];
    const newValidation = {};
    let allValid = true;

    for (const f of fieldsToCheck) {
      const value =
        f === "monthly_salary" ? formData[f].replace(/,/g, "") : formData[f];
      const ok = validateField(f, value);
      newValidation[f] = ok;
      if (!ok) allValid = false;
    }

    setValidation(newValidation);
    if (!allValid) return;

    setIsSubmitting(true);

    const payload = {
      ...formData,
      monthly_salary: formData.monthly_salary
        ? parseFloat(formData.monthly_salary.replace(/,/g, ""))
        : "",
    };

    if (staffData?.id) payload.id = staffData.id;
    if (staffData?.staff_id) payload.staff_id = staffData.staff_id;

    await onSave(payload);
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-auto flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh", height: "80vh" }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {staffData ? "Edit Staff" : "Staff Entry"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="flex-1 p-6 space-y-4 overflow-y-auto"
        >
          {/* --- Personal Info Section --- */}

          
          {/* 🌍 Address Information Section with Geoapify */}
          <GeoapifyContext apiKey="14cedd3fa25d49deacc7da7d7f48b00e">
            <div className="grid grid-cols-1 gap-4">
              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District *
                </label>
                <GeoapifyGeocoderAutocomplete
                  placeholder="Search for district..."
                  value={formData.district}
                  type="state" // ✅ valid type
                  filterByCountryCode={["ug"]}
                  lang="en"
                  limit={10}
                  placeSelect={(value) => {
                    if (!value || !value.properties) return; // ✅ null check

                    const districtName =
                      value.properties.state ||
                      value.properties.county ||
                      value.properties.city ||
                      value.properties.formatted ||
                      "";

                    const bbox = value.bbox || null;

                    setFormData((prev) => ({
                      ...prev,
                      district: districtName,
                      subcounty: "",
                      parish: "",
                      _districtBBox: bbox,
                    }));

                    setValidation((prev) => ({
                      ...prev,
                      district: validateField("district", districtName),
                    }));
                  }}
                  debounceDelay={250}
                  className="w-full"
                />
                {validation.district === false && (
                  <p className="mt-1 text-xs text-red-600">
                    District is required.
                  </p>
                )}
              </div>

              {/* Subcounty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcounty *
                </label>
                <GeoapifyGeocoderAutocomplete
                  placeholder={
                    formData.district
                      ? "Search for subcounty..."
                      : "Select district first"
                  }
                  value={formData.subcounty}
                  type="locality"
                  filterByCountryCode={["ug"]}
                  lang="en"
                  limit={10}
                  filterByRect={
                    formData._districtBBox
                      ? {
                          lon1: formData._districtBBox[0],
                          lat1: formData._districtBBox[1],
                          lon2: formData._districtBBox[2],
                          lat2: formData._districtBBox[3],
                        }
                      : undefined
                  }
                  disabled={!formData.district}
                  placeSelect={(value) => {
                    if (!value || !value.properties) return; // ✅ null check

                    const subcountyName =
                      value.properties.town ||
                      value.properties.locality ||
                      value.properties.suburb ||
                      value.properties.county ||
                      value.properties.formatted ||
                      "";

                    const bbox = value.bbox || null;

                    setFormData((prev) => ({
                      ...prev,
                      subcounty: subcountyName,
                      parish: "",
                      _subcountyBBox: bbox,
                    }));

                    setValidation((prev) => ({
                      ...prev,
                      subcounty: validateField("subcounty", subcountyName),
                    }));
                  }}
                  debounceDelay={250}
                  className="w-full"
                />
                {validation.subcounty === false && (
                  <p className="mt-1 text-xs text-red-600">
                    Subcounty is required.
                  </p>
                )}
              </div>

              {/* Parish */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parish *
                </label>
                <GeoapifyGeocoderAutocomplete
                  placeholder={
                    formData.subcounty
                      ? "Search for parish..."
                      : "Select subcounty first"
                  }
                  value={formData.parish}
                  type="locality"
                  filterByCountryCode={["ug"]}
                  lang="en"
                  limit={10}
                  filterByRect={
                    formData._subcountyBBox
                      ? {
                          lon1: formData._subcountyBBox[0],
                          lat1: formData._subcountyBBox[1],
                          lon2: formData._subcountyBBox[2],
                          lat2: formData._subcountyBBox[3],
                        }
                      : undefined
                  }
                  disabled={!formData.subcounty}
                  placeSelect={(value) => {
                    if (!value || !value.properties) return; // ✅ null check

                    const parishName =
                      value.properties.neighbourhood ||
                      value.properties.village ||
                      value.properties.suburb ||
                      value.properties.locality ||
                      value.properties.formatted ||
                      "";

                    setFormData((prev) => ({
                      ...prev,
                      parish: parishName,
                    }));

                    setValidation((prev) => ({
                      ...prev,
                      parish: validateField("parish", parishName),
                    }));
                  }}
                  debounceDelay={250}
                  className="w-full"
                />
                {validation.parish === false && (
                  <p className="mt-1 text-xs text-red-600">
                    Parish is required.
                  </p>
                )}
              </div>

              {/* Village */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Village *
                </label>
                <input
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  placeholder="e.g., Kisaasi"
                  required
                  className="w-full p-3 border rounded-lg outline-none focus:ring-1 focus:ring-[#795548] bg-white"
                  style={{
                    borderColor:
                      validation.village === true
                        ? "#10B981"
                        : validation.village === false
                        ? "#EF4444"
                        : "#D1D5DB",
                  }}
                />
                {validation.village === false && (
                  <p className="mt-1 text-xs text-red-600">
                    This field is required — must be at least 2 characters.
                  </p>
                )}
              </div>
            </div>
          </GeoapifyContext>

          {/* --- Employment details --- */}
          <section className="bg-gray-50 border border-gray-100 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Salary (UGX)
            </label>
            <input
              name="monthly_salary"
              type="text"
              value={formData.monthly_salary}
              onChange={handleChange}
              placeholder="e.g., 500,000"
              className="w-full border border-gray-300 rounded-lg p-2"
            />
            {validation.monthly_salary === false && (
              <p className="mt-1 text-xs text-red-600">
                Monthly Salary is required and must be valid.
              </p>
            )}
          </section>
        </form>

        <div className="flex justify-end p-4 border-t border-gray-200 space-x-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-white rounded-md bg-[#9F4A2F]"
          >
            {isSubmitting
              ? "Saving..."
              : staffData
              ? "Save Changes"
              : "Record Staff"}
          </button>
        </div>
      </div>
    </div>
  );
};

const TABLE_HEADERS = [
  { key: "staff_id", label: "Staff Id", type: "string" },
  { key: "first_name", label: "First Name", type: "string" },
  { key: "last_name", label: "Last Name", type: "string" },
  { key: "gender", label: "Gender", type: "string" },
  { key: "nin", label: "NIN", type: "string" },
  { key: "district", label: "District", type: "string" },
  { key: "hire_date", label: "Hire Date", type: "date" },
  { key: "salary", label: "Monthly Salary (UGX)", type: "number" },
  { key: "actions", label: "Actions", type: "actions" },
];

// FIXED: Added salary field to initial mock data
const INITIAL_STAFF_DATA = [
  {
    id: 1,
    staff_id: "RF001",
    first_name: "Billy",
    last_name: "Banks",
    gender: "Male",
    nin: "CM004GDT777G88",
    district: "Wakiso",
    date_hired: "2023-06-15",
    salary: 500000,
  },
  {
    id: 2,
    staff_id: "RF002",
    first_name: "Ivan",
    last_name: "Koreta",
    gender: "Male",
    nin: "CM00566674632A",
    district: "Wakiso",
    date_hired: "2024-11-20",
    salary: 450000,
  },
  {
    id: 3,
    staff_id: "RF003",
    first_name: "Jackson",
    last_name: "Ssemengo",
    gender: "Male",
    nin: "CM004673H7645F",
    district: "Wakiso",
    date_hired: "2024-05-07",
    salary: 600000,
  },
  {
    id: 4,
    staff_id: "RF004",
    first_name: "Justine",
    last_name: "Natasha",
    gender: "Female",
    nin: "CF003674F7894A",
    district: "Wakiso",
    date_hired: "2024-10-16",
    salary: 550000,
  },
  {
    id: 5,
    staff_id: "RF005",
    first_name: "Agnes",
    last_name: "Nalubega",
    gender: "Female",
    nin: "CF003675N876B",
    district: "Mpigi",
    date_hired: "2023-03-22",
    salary: 480000,
  },
  {
    id: 6,
    staff_id: "RF006",
    first_name: "Peter",
    last_name: "Mwesigye",
    gender: "Male",
    nin: "CM004678P1234C",
    district: "Mbarara",
    date_hired: "2024-01-10",
    salary: 520000,
  },
];


function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const navigate = useNavigate();

  const [sortConfig, setSortConfig] = useState({
    key: "date_hired",
    direction: "descending",
  });
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(STAFF_API_ENDPOINT);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      let normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      // Map monthly_salary from API to salary for frontend
      normalized = normalized.map((staff) => ({
        ...staff,
        salary: staff.monthly_salary || staff.salary || 0,
      }));

      console.log("API Response:", normalized);
      console.log("Sample API staff record:", normalized[0]);

      // Map monthly_salary from API to salary for frontend
      const finalStaffList = normalized.map((staff) => ({
        ...staff,
        salary: staff.monthly_salary || staff.salary || 0,
        hire_date: staff.hire_date || staff.date_hired,
      }));

      console.log("Final staff data from API:", finalStaffList);
      setStaff(finalStaffList);
    } catch (err) {
      console.error("API Error:", err);
      setError("Could not load data from API. Please check your connection and try again.");
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    console.log("Initial staff load");
    fetchStaff();
  }, [fetchStaff]);

  const filteredStaff = useMemo(() => {
    let current = staff;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      current = current.filter(
        (su) =>
          su.first_name?.toLowerCase().includes(s) ||
          su.last_name?.toLowerCase().includes(s) ||
          su.staff_id?.toLowerCase().includes(s)
      );
    }
    if (filterGender) {
      current = current.filter(
        (su) => su.gender?.toLowerCase() === filterGender.toLowerCase()
      );
    }
    return current;
  }, [staff, searchTerm, filterGender]);

  const sortedStaff = useMemo(() => {
    const base = Array.isArray(filteredStaff) ? filteredStaff : [];
    const items = [...base];
    if (sortConfig.key) {
      items.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        const headerType = TABLE_HEADERS.find(
          (h) => h.key === sortConfig.key
        )?.type;
        if (headerType === "date") {
          const aDate = new Date(
            a.hire_date || a.date_hired || a[sortConfig.key] || 0
          );
          const bDate = new Date(
            b.hire_date || b.date_hired || b[sortConfig.key] || 0
          );
          return sortConfig.direction === "ascending"
            ? aDate - bDate
            : bDate - aDate;
        }
        if (headerType === "number") {
          const aNum = Number(aVal) || 0;
          const bNum = Number(bVal) || 0;
          return sortConfig.direction === "ascending"
            ? aNum - bNum
            : bNum - aNum;
        }
        if (aVal < bVal) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filteredStaff, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending")
      direction = "descending";
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <ArrowUp className="w-3 h-3 ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1" />
    );
  };

  const handleNewStaff = () => {
    setStaffToEdit(null);
    setIsStaffModalOpen(true);
  };

  const handleEditStaff = (staffMember) => {
    // convert to modal shape when opening
    setStaffToEdit({
      ...staffMember,
      hire_date: staffMember.hire_date || staffMember.date_hired || "",
    });
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (savedStaffData) => {
    console.log("handleSaveStaff called with:", savedStaffData);
    if (!savedStaffData) return;

    // Validate and prepare data for API
    // Convert salary from formatted string (e.g., "7,000,000") to number (e.g., 7000000)
    const salaryValue =
      typeof savedStaffData.salary === "string"
        ? parseFloat(savedStaffData.salary.replace(/,/g, ""))
        : savedStaffData.salary || 0;

    const apiData = {
      first_name: savedStaffData.first_name?.trim() || "",
      last_name: savedStaffData.last_name?.trim() || "",
      nin: savedStaffData.nin?.trim().toUpperCase() || "", // Convert to uppercase for API
      district: savedStaffData.district?.trim() || "",
      sub_county: (
        savedStaffData.subcounty ||
        savedStaffData.sub_county ||
        ""
      ).trim(),
      parish: savedStaffData.parish?.trim() || "",
      village: savedStaffData.village?.trim() || "",
      gender: savedStaffData.gender?.trim() || "",
      date_hired: savedStaffData.hire_date || savedStaffData.date_hired || "",
      employment_type: savedStaffData.employment_status || "Full-time", // Use exact value from form
      monthly_salary: salaryValue, // Backend expects monthly_salary field name
      is_active: true,
    };

    // Validate required fields
    const requiredFields = [
      "first_name",
      "last_name",
      "nin",
      "district",
      "sub_county",
      "parish",
      "village",
      "gender",
      "date_hired",
      "employment_type",
      "monthly_salary",
    ];
    const missingFields = requiredFields.filter((field) => {
      const value = apiData[field];
      return (
        value === null ||
        value === undefined ||
        value === "" ||
        (typeof value === "number" && isNaN(value))
      );
    });

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      alert(
        `Missing required fields:\n${missingFields
          .map((f) => `• ${f.replace(/_/g, " ")}`)
          .join("\n")}`
      );
      return;
    }

    // Validate NIN pattern (alphanumeric only, no symbols)
    const ninPattern = /^(CM|CF)[A-Za-z0-9]{12}$/;
    if (!ninPattern.test(savedStaffData.nin?.trim() || "")) {
      console.error("Invalid NIN format:", savedStaffData.nin);
      alert(
        "Invalid NIN format\n\nNational ID must start with CM or CF and be exactly 14 alphanumeric characters."
      );
      return;
    }

    console.log("Sending to API:", JSON.stringify(apiData, null, 2));

    try {
      if (staffToEdit) {
        // Update existing staff via PUT request
        console.log("Updating existing staff via API");
        const response = await fetch(
          `${STAFF_API_ENDPOINT}${staffToEdit.staff_id}/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(apiData),
          }
        );

        console.log("API Response Status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response Status:", response.status);
          console.error("API Error Response Body:", errorText);
          console.error("Payload sent:", JSON.stringify(apiData, null, 2));
          console.error(
            "Response Content-Type:",
            response.headers.get("content-type")
          );

          try {
            const errorJson = JSON.parse(errorText);
            console.error("API Error Details:", errorJson);
            const errorMsg = Object.entries(errorJson)
              .map(
                ([key, val]) =>
                  `${key}: ${Array.isArray(val) ? val.join(", ") : val}`
              )
              .join("\n");
            alert(`Failed to update staff:\n\n${errorMsg}`);
          } catch (parseError) {
            console.error("Failed to parse error as JSON:", parseError);
            // If it's not JSON, show the raw error (probably HTML)
            const shortError = errorText.substring(0, 500);
            alert(
              `Failed to update staff\n\nServer Error ${response.status}:\n${shortError}`
            );
          }
          throw new Error(`API Error: ${response.status}`);
        }

        const updatedStaff = await response.json();
        console.log("Staff updated successfully:", updatedStaff);

        // FIXED: Update local state - ensure salary is properly preserved
        const staffWithSalary = {
          ...updatedStaff,
          salary: updatedStaff.monthly_salary || savedStaffData.salary, // Use API's monthly_salary or form data
          hire_date: updatedStaff.hire_date || updatedStaff.date_hired,
          date_hired: updatedStaff.hire_date || updatedStaff.date_hired,
        };

        // Update local state
        const index = staff.findIndex(
          (s) => s.id === staffToEdit.id || s.staff_id === staffToEdit.staff_id
        );
        if (index > -1) {
          const updatedStaffList = [...staff];
          updatedStaffList[index] = { ...staffWithSalary };
          setStaff(updatedStaffList);
        }

        // Close modal first
        setIsStaffModalOpen(false);
        setStaffToEdit(null);

        // Refresh data from API to ensure we have latest data
        fetchStaff();

        // Then show success message
        setTimeout(() => {
          setShowSuccessMessage(true);
          setTimeout(() => {
            setShowSuccessMessage(false);
          }, 3000);
        }, 100);
      } else {
        // Add new staff via POST request
        console.log("Creating new staff via API");
        const response = await fetch(STAFF_API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        });

        console.log("API Response Status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response Status:", response.status);
          console.error("API Error Response Body:", errorText);
          console.error("Payload sent:", JSON.stringify(apiData, null, 2));
          console.error(
            "Response Content-Type:",
            response.headers.get("content-type")
          );

          try {
            const errorJson = JSON.parse(errorText);
            console.error("API Error Details:", errorJson);
            const errorMsg = Object.entries(errorJson)
              .map(
                ([key, val]) =>
                  `${key}: ${Array.isArray(val) ? val.join(", ") : val}`
              )
              .join("\n");
            alert(`Failed to create staff:\n\n${errorMsg}`);
          } catch (parseError) {
            console.error("Failed to parse error as JSON:", parseError);
            // If it's not JSON, show the raw error (probably HTML)
            const shortError = errorText.substring(0, 500);
            alert(
              `Failed to create staff\n\nServer Error ${response.status}:\n${shortError}`
            );
          }
          throw new Error(`API Error: ${response.status}`);
        }

        const newStaff = await response.json();
        console.log("Staff created successfully:", newStaff);

        // FIXED: Update local state with API-generated data, ensuring salary is included
        const newStaffWithSalary = {
          ...newStaff,
          salary: newStaff.monthly_salary || savedStaffData.salary, // Use API's monthly_salary or form data
          hire_date: newStaff.hire_date || newStaff.date_hired,
          date_hired: newStaff.hire_date || newStaff.date_hired,
        };

        // Update local state - add to beginning
        const updatedStaffList = [newStaffWithSalary, ...staff];
        setStaff(updatedStaffList);

        // Close modal first
        setIsStaffModalOpen(false);
        setStaffToEdit(null);

        // Refresh data from API to ensure we have latest data
        fetchStaff();

        // Then show success message
        setTimeout(() => {
          setShowSuccessMessage(true);
          setTimeout(() => {
            setShowSuccessMessage(false);
          }, 3000);
        }, 100);
      }
    } catch (error) {
      console.error("Failed to save staff to API:", error);

      // Check if it's a network error
      if (
        error.message.includes("fetch") ||
        error.message.includes("Network")
      ) {
        alert(
          "Network Error\n\nCould not connect to the server. Please check:\n• Your internet connection\n• The server is running at http://142.93.94.236:8000\n• CORS is properly configured on the server"
        );
      } else {
        alert(
          `Failed to save to database\n\nError: ${error.message}`
        );
      }
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    setDeleting(true);
    try {
      // Delete from API
      const response = await fetch(
        `${STAFF_API_ENDPOINT}${staffToDelete.staff_id}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok || response.status === 404) {
        console.log("Staff deleted successfully from API");

        // Update state using findIndex for consistency
        const stateIndex = staff.findIndex(
          (s) =>
            s.id === staffToDelete.id || s.staff_id === staffToDelete.staff_id
        );
        if (stateIndex > -1) {
          const updatedStaffList = [...staff];
          updatedStaffList.splice(stateIndex, 1);
          setStaff(updatedStaffList);
        }

        setShowDeleteModal(false);
        setStaffToDelete(null);

        // Refresh data from API to ensure we have latest data
        fetchStaff();
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (err) {
      console.error("Failed to delete from API:", err);
      setError("Failed to delete staff from database. Please try again.");
      setShowDeleteModal(false);
      setStaffToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const renderTableContent = () => {
    // Add debug logging to see what data we have
    console.log("Rendering staff data:", sortedStaff);

    if (loading) {
      return (
        <tr className="h-24">
          <td
            colSpan={TABLE_HEADERS.length}
            className="text-center py-6 text-gray-600"
          >
            <Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-accent-btn" />
            Loading staff records...
          </td>
        </tr>
      );
    }

    if (error && staff.length === 0) {
      return (
        <tr className="h-24">
          <td
            colSpan={TABLE_HEADERS.length}
            className="text-center py-6 text-red-600 font-medium"
          >
            {error}
          </td>
        </tr>
      );
    }

    if (sortedStaff.length === 0) {
      return (
        <tr className="h-24">
          <td
            colSpan={TABLE_HEADERS.length}
            className="text-center py-6 text-gray-500 italic"
          >
            No staff records found matching your criteria.
          </td>
        </tr>
      );
    }

    return sortedStaff.map((staffMember, index) => {
      // Debug each staff member's salary
      console.log(
        `Staff ${staffMember.first_name} salary:`,
        staffMember.salary
      );

      return (
        <tr
          key={staffMember.id || index}
          className="border-b transition-colors duration-150 hover:bg-gray-50"
        >
          <td className="px-6 py-3 text-left font-medium text-gray-800">
            {staffMember.staff_id || "N/A"}
          </td>
          <td className="px-6 py-3 text-left text-gray-600">
            {staffMember.first_name || "N/A"}
          </td>
          <td className="px-6 py-3 text-left text-gray-600">
            {staffMember.last_name || "N/A"}
          </td>
          <td className="px-6 py-3 text-left text-gray-600">
            {staffMember.gender || "-"}
          </td>
          <td className="px-6 py-3 text-left text-gray-600">
            {staffMember.nin || "-"}
          </td>
          <td className="px-6 py-3 text-left text-gray-600">
            {staffMember.district || "-"}
          </td>
          <td className="px-6 py-3 text-left text-gray-600">
            {staffMember.hire_date || staffMember.date_hired || "N/A"}
          </td>
          <td className="px-6 py-3 text-right text-gray-600">
            {staffMember.salary && staffMember.salary > 0
              ? Number(staffMember.salary).toLocaleString()
              : "No salary"}
          </td>
          <td className="px-6 py-3 text-center">
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handleEditStaff(staffMember)}
                className="text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                title="Edit Staff Member"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setStaffToDelete(staffMember);
                  setShowDeleteModal(true);
                }}
                className="text-error hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                title="Delete Staff Member"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
      );
    });
  };

  // Calculate KPI metrics
  const kpis = useMemo(() => {
    if (!staff || staff.length === 0) {
      return {
        totalStaff: 0,
        maleStaff: 0,
        femaleStaff: 0,
        recentHires: 0,
      };
    }

    const totalStaff = staff.length;
    const maleStaff = staff.filter((s) => s.gender === "Male").length;
    const femaleStaff = staff.filter((s) => s.gender === "Female").length;

    // Count staff hired in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentHires = staff.filter((s) => {
      const hireDate = new Date(s.hire_date || s.date_hired);
      return hireDate >= thirtyDaysAgo;
    }).length;

    return {
      totalStaff,
      maleStaff,
      femaleStaff,
      recentHires,
    };
  }, [staff]);

  const KPICards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xs font-medium tracking-wide uppercase"
            style={{ color: "#666" }}
          >
            Total Staff
          </h3>
          <Users size={20} style={{ color: "#8B5A3C" }} />
        </div>
        {loading ? (
          <div className="flex items-center gap-2 mt-2">
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: "#8B5A3C" }}
            />
            <span className="text-sm" style={{ color: "#888" }}>
              Loading...
            </span>
          </div>
        ) : (
          <div className="mt-2">
            <div className="flex flex-col gap-1">
              <p className="text-3xl font-bold" style={{ color: "#3D2817" }}>
                {kpis.totalStaff}
              </p>
            </div>
            <div className="mt-3 text-xs">
              <p style={{ color: "#666" }}>Active employees</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xs font-medium tracking-wide uppercase"
            style={{ color: "#666" }}
          >
            Male Staff
          </h3>
          <UserCheck size={20} style={{ color: "#8B5A3C" }} />
        </div>
        {loading ? (
          <div className="flex items-center gap-2 mt-2">
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: "#8B5A3C" }}
            />
            <span className="text-sm" style={{ color: "#888" }}>
              Loading...
            </span>
          </div>
        ) : (
          <div className="mt-2">
            <div className="flex flex-col gap-1">
              <p className="text-3xl font-bold" style={{ color: "#3D2817" }}>
                {kpis.maleStaff}
              </p>
            </div>
            <div className="mt-3 text-xs">
              <p style={{ color: "#666" }}>
                {kpis.totalStaff > 0
                  ? `${((kpis.maleStaff / kpis.totalStaff) * 100).toFixed(
                      0
                    )}% of staff`
                  : "0% of staff"}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xs font-medium tracking-wide uppercase"
            style={{ color: "#666" }}
          >
            Female Staff
          </h3>
          <UserX size={20} style={{ color: "#8B5A3C" }} />
        </div>
        {loading ? (
          <div className="flex items-center gap-2 mt-2">
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: "#8B5A3C" }}
            />
            <span className="text-sm" style={{ color: "#888" }}>
              Loading...
            </span>
          </div>
        ) : (
          <div className="mt-2">
            <div className="flex flex-col gap-1">
              <p className="text-3xl font-bold" style={{ color: "#3D2817" }}>
                {kpis.femaleStaff}
              </p>
            </div>
            <div className="mt-3 text-xs">
              <p style={{ color: "#666" }}>
                {kpis.totalStaff > 0
                  ? `${((kpis.femaleStaff / kpis.totalStaff) * 100).toFixed(
                      0
                    )}% of staff`
                  : "0% of staff"}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xs font-medium tracking-wide uppercase"
            style={{ color: "#666" }}
          >
            Recent Hires
          </h3>
          <TrendingUp size={20} style={{ color: "#8B5A3C" }} />
        </div>
        {loading ? (
          <div className="flex items-center gap-2 mt-2">
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: "#8B5A3C" }}
            />
            <span className="text-sm" style={{ color: "#888" }}>
              Loading...
            </span>
          </div>
        ) : (
          <div className="mt-2">
            <div className="flex flex-col gap-1">
              <p className="text-3xl font-bold" style={{ color: "#3D2817" }}>
                {kpis.recentHires}
              </p>
            </div>
            <div className="mt-3 text-xs">
              <p style={{ color: "#666" }}>Last 30 days</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <SideNav>
      <main className="p-4 sm:p-6 md:p-8 pt-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#4A3423] mb-6">
          Staff Management Overview
        </h2>

        {/* Success Message Banner */}
        {showSuccessMessage && (
          <div
            className="mb-6 p-4 rounded-lg shadow-lg border-l-4 animate-fade-in"
            style={{
              backgroundColor: "#D4EDDA",
              borderColor: "#28A745",
              color: "#155724",
            }}
          >
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold text-base">
                Staff record saved successfully
              </span>
            </div>
          </div>
        )}

        <KPICards />

        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div className="hidden md:block"></div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={handleNewStaff}
              className="py-2 px-4 shadow-xl rounded-xl flex items-center font-semibold text-white hover:shadow-2xl transition-all duration-200"
              style={{ backgroundColor: "#8B4513" }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Record New Staff
            </button>
            <button
              onClick={() =>
                alert("Exporting to Excel is not yet implemented.")
              }
              className="py-2 px-4 shadow-xl rounded-xl font-semibold hover:shadow-2xl transition-all duration-200"
              style={{
                backgroundColor: "#efebe9",
                color: "#783A1E",
                border: "none",
              }}
            >
              Export to Excel
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-stretch sm:items-center p-4 rounded-lg bg-white shadow-md">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by staff name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none"
            />
          </div>

          <div className="relative w-full sm:w-48">
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="appearance-none w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg bg-white outline-none"
            >
              <option value="">Filter by Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <ChevronsDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <button
            onClick={() => fetchStaff()}
            disabled={loading}
            className="py-2 px-4 shadow-xl rounded-xl flex items-center justify-center disabled:opacity-50"
            style={{
              backgroundColor: CoffeeColors.ACTIVE_LINK_BG,
              color: CoffeeColors.ACTIVE_LINK_TEXT,
              border: "none",
            }}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />{" "}
            Refresh Data
          </button>
        </div>

        <div className="mt-8">
          <div className="w-full bg-white shadow-xl rounded-2xl overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead
                className="sticky top-0 z-10"
                style={{
                  backgroundColor: CoffeeColors.ACTIVE_LINK_BG,
                  color: CoffeeColors.DARK_BROWN,
                }}
              >
                <tr>
                  {TABLE_HEADERS.map((header) => (
                    <th
                      key={header.key}
                      className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${
                        header.type === "actions"
                          ? ""
                          : "cursor-pointer hover:bg-accent-btn/90"
                      } transition-colors duration-150`}
                      onClick={
                        header.type === "actions"
                          ? undefined
                          : () => requestSort(header.key)
                      }
                      scope="col"
                    >
                      <div
                        className={`flex items-center ${
                          header.type === "number"
                            ? "justify-end"
                            : header.type === "actions"
                            ? "justify-center"
                            : "justify-start"
                        }`}
                      >
                        {header.label}
                        {header.type !== "actions" && getSortIcon(header.key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {renderTableContent()}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <StaffEntryModal
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          setStaffToEdit(null);
        }}
        staffData={staffToEdit}
        onSave={handleSaveStaff}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && staffToDelete && (
        <div
          className="fixed inset-0 flex justify-center items-center transition-all duration-300 backdrop-blur-sm"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(75, 52, 35, 0.5) 100%)",
            zIndex: 1000,
          }}
          onClick={() => {
            setShowDeleteModal(false);
            setStaffToDelete(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#4A3423]">
                Confirm Delete
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setStaffToDelete(null);
                }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete staff member:{" "}
              <strong>
                {staffToDelete.first_name} {staffToDelete.last_name}
              </strong>
              ?
              <br />
              <span className="text-sm text-gray-500">
                This action cannot be undone.
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setStaffToDelete(null);
                }}
                className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStaff}
                disabled={deleting}
                className="px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 flex items-center"
                style={{
                  background:
                    "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                }}
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </SideNav>
  );
}

export default StaffPage;
