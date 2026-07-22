import { Table, Pagination, Group, Text, Badge, Avatar, Box, Skeleton, Center } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useState } from "react";
import SectionHeading from "../common/SectionHeading";
import mockActivity from "../../data/mockActivity";

function ActivityTable({ loading = false }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activePage, setPage] = useState(1);
  const itemsPerPage = 5;
  
  const safeActivity = Array.isArray(mockActivity) ? mockActivity : [];
  const totalPages = Math.max(1, Math.ceil(safeActivity.length / itemsPerPage));
  
  const paginatedData = safeActivity.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "secondary";
      case "warning":
        return "yellow";
      case "error":
        return "red";
      default:
        return "gray";
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "—";
    try {
      const date = new Date(timestamp);
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  if (loading) {
    return (
      <div>
        <SectionHeading title="Recent Activity" description="Latest user actions and system events" />
        <Box>
          {[1, 2, 3, 4, 5].map((row) => (
            <Skeleton key={row} height={50} mb="xs" />
          ))}
        </Box>
      </div>
    );
  }

  const rows = paginatedData.map((item) => (
    <Table.Tr key={item?.id ?? Math.random()}>
      <Table.Td>
        <Group gap="sm">
          <Avatar size="sm" name={item?.user ?? "Unknown"} color="primary">
            {item?.avatar ?? "?"}
          </Avatar>
          <Text size="sm" fw={500}>
            {item?.user ?? "Unknown User"}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={isMobile ? 1 : 2}>
          {item?.action ?? "—"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">
          {formatTimestamp(item?.timestamp)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(item?.status)} variant="light">
          {item?.status ?? "unknown"}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div>
      <SectionHeading title="Recent Activity" description="Latest user actions and system events" />
      <Box style={{ overflowX: isMobile ? "auto" : "visible" }}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>User</Table.Th>
              <Table.Th>Action</Table.Th>
              <Table.Th>Timestamp</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? rows : (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Center py="xl">
                    <Text c="dimmed">No recent activity to display</Text>
                  </Center>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Box>
      {safeActivity.length > itemsPerPage && (
        <Group justify="center" mt="md">
          <Pagination
            total={totalPages}
            value={activePage}
            onChange={setPage}
            size={isMobile ? "sm" : "md"}
          />
        </Group>
      )}
    </div>
  );
}

export default ActivityTable;