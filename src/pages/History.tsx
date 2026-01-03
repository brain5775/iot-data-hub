import { useState } from "react";
import { Home, ChevronRight, Search, Download, FileSpreadsheet, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { devices, generateHistoryData, HistoryRecord } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

export default function HistoryPage() {
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSearch = () => {
    if (!selectedDevice || !startDate || !endDate) {
      toast({
        title: "Validation Error",
        description: "Please select device and date range",
        variant: "destructive",
      });
      return;
    }

    const data = generateHistoryData(
      selectedDevice,
      new Date(startDate),
      new Date(endDate)
    );
    setHistoryData(data);
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    if (historyData.length === 0) {
      toast({
        title: "No Data",
        description: "No data to export",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = [
      "No",
      "Timestamp",
      "IR",
      "IS",
      "IT",
      "I Average",
      "Volt R-S",
      "Volt S-T",
      "Volt T-R",
      "Volt R-N",
      "Volt S-N",
      "Volt T-N",
      "V Average",
      "PR",
      "PS",
      "PT",
      "Total Power",
    ];

    const csvContent = [
      headers.join(","),
      ...historyData.map((row) =>
        [
          row.id,
          `"${row.timestamp}"`,
          row.ir.toFixed(2),
          row.is.toFixed(2),
          row.it.toFixed(2),
          row.iAverage.toFixed(2),
          row.voltRS.toFixed(2),
          row.voltST.toFixed(2),
          row.voltTR.toFixed(2),
          row.voltRN.toFixed(2),
          row.voltSN.toFixed(2),
          row.voltTN.toFixed(2),
          row.vAverage.toFixed(2),
          row.pr.toFixed(2),
          row.ps.toFixed(2),
          row.pt.toFixed(2),
          row.totalPower.toFixed(2),
        ].join(",")
      ),
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `history_${selectedDevice}_${startDate}_${endDate}.csv`;
    link.click();

    toast({
      title: "Export Complete",
      description: "Data exported to CSV successfully",
    });
  };

  const filteredData = historyData.filter((row) =>
    Object.values(row).some((val) =>
      val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">History</h1>
          <p className="page-subtitle">Show logging data by range date</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Home className="w-4 h-4" />
          <span>History</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Find</span>
        </div>
      </div>

      {/* Filter Section */}
      <div className="card-section animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Detail</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label className="text-muted-foreground">ID Device</Label>
            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger>
                <SelectValue placeholder="Select device" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <Button onClick={handleSearch} className="gap-2">
            <Search className="w-4 h-4" />
            Search
          </Button>
        </div>
      </div>

      {/* Results Section */}
      <div className="card-section animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Result</h2>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={exportToExcel}
              disabled={historyData.length === 0}
              className="gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export to Excel
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Search:</span>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
                placeholder="Filter results..."
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>IR</th>
                <th>IS</th>
                <th>IT</th>
                <th>IAverage</th>
                <th>Volt R-S</th>
                <th>Volt S-T</th>
                <th>Volt T-R</th>
                <th>Volt R-N</th>
                <th>Volt S-N</th>
                <th>Volt T-N</th>
                <th>VAverage</th>
                <th>PR</th>
                <th>PS</th>
                <th>PT</th>
                <th>Total Power</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.ir.toFixed(2)}</td>
                    <td>{row.is.toFixed(2)}</td>
                    <td>{row.it.toFixed(2)}</td>
                    <td>{row.iAverage.toFixed(2)}</td>
                    <td>{row.voltRS.toFixed(2)}</td>
                    <td>{row.voltST.toFixed(2)}</td>
                    <td>{row.voltTR.toFixed(2)}</td>
                    <td>{row.voltRN.toFixed(2)}</td>
                    <td>{row.voltSN.toFixed(2)}</td>
                    <td>{row.voltTN.toFixed(2)}</td>
                    <td>{row.vAverage.toFixed(2)}</td>
                    <td>{row.pr.toFixed(2)}</td>
                    <td>{row.ps.toFixed(2)}</td>
                    <td>{row.pt.toFixed(2)}</td>
                    <td>{row.totalPower.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={16} className="text-center py-8 text-muted-foreground">
                    No data available in table
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
